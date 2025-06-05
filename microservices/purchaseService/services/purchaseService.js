const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const EventService = require('./eventService');
const axios = require('axios');

class PurchaseService {
  constructor() {
    this.eventService = new EventService();
    this.courseServiceUrl = process.env.COURSE_SERVICE_URL || 'http://localhost:5001';
    this.httpTimeout = 30000; // 30 seconds
    this.maxRetries = 3;
  }

  async createPaymentIntent({ userId, amount, currency, metadata }) {
    try {
      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          userId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store payment intent in database
      await prisma.purchase.create({
        data: {
          userId,
          paymentIntentId: paymentIntent.id,
          amount,
          currency,
          status: 'PENDING',
          metadata: metadata || {}
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment({ userId, paymentIntentId, token }) {
    try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        try {
          // Get user's cart items from cart service
          const cartItems = await this.getCartItems(userId, token);

          // {
          //   id: 21,
          //   studentId: '7',
          //   courseId: 16,
          //   addedAt: '2025-06-05T10:54:43.959Z',
          //   course: {
          //     id: 16,
          //     title: 'fdsla;f',
          //     description: 'fdsaklfdslafjdslkf',
          //     price: 34.34,
          //     coverPhotoUrl: 'https://firebasestorage.googleapis.com/v0/b/agribazaar-dbdad.appspot.com/o/course_covers%2F1747656916401-svgviewer-output%20(1).svg?alt=media&token=907aa43e-cd71-45b7-8724-13554421b4b1',
          //     level: 'BEGINNER',
          //     topic: 'Language',
          //     createdAt: '2025-05-19T12:15:17.988Z',
          //     updatedAt: '2025-05-19T13:56:12.024Z',
          //     instructorId: '4',
          //     averageRating: 0
          //   }
          // }
          
          if (!cartItems || cartItems.length === 0) {
            throw new Error('No items found in cart');
          }


          // Start database transaction for purchase completion
          const result = await prisma.$transaction(async (tx) => {
            // Update purchase record to completed
            const purchase = await tx.purchase.update({
              where: { paymentIntentId },
              data: {
                status: 'COMPLETED',
                completedAt: new Date()
              }
            });

            // Verify the purchase belongs to the user
            if (purchase.userId !== userId) {
              throw new Error('Unauthorized: Purchase does not belong to user');
            }

            // Create purchase items from cart
            const purchaseItems = cartItems.map(item => ({
              purchaseId: purchase.id,
              courseId: String(item.courseId), // Ensure string for consistency
              price: item.course.price
            }));

            await tx.purchaseItem.createMany({
              data: purchaseItems
            });

            return { purchase, cartItems };
          });

          // Create enrollments via course service
          const enrollmentResult = await this.createEnrollments(userId, cartItems, result.purchase.id, token);
          
          if (enrollmentResult.success) {
            // Clear user's cart
            await this.clearCart(userId, token);
            
            return {
              paymentIntentId,
              status: 'completed',
              enrollments: cartItems.map(item => ({
                studentId: userId,
                courseId: item.courseId,
              }))
            };
          } else {
            throw new Error(`Enrollment failed: ${enrollmentResult.error}`);
          }

        } catch (enrollmentError) {
          console.error('Enrollment process failed:', enrollmentError);
          
          // Handle enrollment failure - refund and update status
          await this.handleEnrollmentFailure(paymentIntentId, enrollmentError.message);
          
          throw new Error(`Purchase completed but enrollment failed: ${enrollmentError.message}. Refund has been initiated.`);
        }

      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Update purchase record with error if not already handled
      await prisma.purchase.update({
        where: { paymentIntentId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          failedAt: new Date()
        }
      }).catch(console.error);
      
      throw error;
    }
  }

  async getCartItems(userId, token) {
    try {
      const response = await axios.get(`${this.courseServiceUrl}/api/cart/${userId}`, {
        timeout: this.httpTimeout,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      // Extract items from the response data
      const items = response.data?.data?.items || [];
      
      if (!items || items.length === 0) {
        throw new Error('No items found in cart');
      }
      
      return items;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw new Error('Failed to fetch cart items');
    }
  }

  async createEnrollments(userId, cartItems, purchaseId, token, retryCount = 0) {
    try {
      const enrollmentData = cartItems.map(item => ({
        studentId: String(userId),
        courseId: Number(item.courseId),
      }));

      // Process all enrollments in parallel with proper error handling
      const enrollmentPromises = enrollmentData.map(enrollment => 
        axios.post(
          `${this.courseServiceUrl}/api/enrollments/enroll/`,
          enrollment,
          {
            timeout: this.httpTimeout,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        ).then(response => ({
          success: true,
          data: response.data,
          enrollment
        })).catch(error => ({
          success: false,
          error: error.response?.data?.message || error.message,
          enrollment
        }))
      );

      const results = await Promise.all(enrollmentPromises);
      
      // Check for any failed enrollments
      const failedEnrollments = results.filter(r => !r.success);
      
      if (failedEnrollments.length > 0) {
        // Log the failed enrollments
        console.error('Some enrollments failed:', failedEnrollments);
        
        // Return the results with both successful and failed enrollments
        return { 
          success: false, 
          data: results,
          failedCount: failedEnrollments.length,
          total: enrollmentData.length
        };
      }

      return { 
        success: true, 
        data: results.map(r => r.data),
        total: enrollmentData.length
      };
    } catch (error) {
      console.error(`Enrollment attempt ${retryCount + 1} failed:`, error.message);
      
      // Retry logic for network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying enrollment creation (attempt ${retryCount + 2})`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.createEnrollments(userId, cartItems, purchaseId, token, retryCount + 1);
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async clearCart(userId, token) {
    try {
      await axios.delete(`${this.courseServiceUrl}/api/cart/${userId}`, {
        timeout: this.httpTimeout,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't throw - cart clearing failure shouldn't fail the entire purchase
    }
  }

  async handleEnrollmentFailure(paymentIntentId, errorMessage) {
    try {
      // Initiate refund with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.charges.data.length > 0) {
        const charge = paymentIntent.charges.data[0];
        await stripe.refunds.create({
          charge: charge.id,
          reason: 'requested_by_customer'
        });
        
        // Update purchase status to REFUNDED
        await prisma.purchase.update({
          where: { paymentIntentId },
          data: {
            status: 'REFUNDED',
            errorMessage: `Enrollment failed: ${errorMessage}. Refund completed.`,
            failedAt: new Date()
          }
        });
      } else {
        // No charge to refund, just mark as failed
        await prisma.purchase.update({
          where: { paymentIntentId },
          data: {
            status: 'FAILED',
            errorMessage: `Enrollment failed: ${errorMessage}. No charge found to refund.`,
            failedAt: new Date()
          }
        });
      }

    } catch (refundError) {
      console.error('Error handling enrollment failure and refund:', refundError);
      
      // Mark for manual review if refund fails
      await prisma.purchase.update({
        where: { paymentIntentId },
        data: {
          status: 'FAILED',
          errorMessage: `Enrollment failed: ${errorMessage}. Refund failed: ${refundError.message}. Manual review required.`,
          failedAt: new Date()
        }
      }).catch(console.error);
    }
  }

  // This function is problematic because we don't have tokens for past purchases
  // Consider removing or implementing a different retry mechanism
  async retryFailedEnrollments() {
    console.warn('retryFailedEnrollments: This function cannot work without stored tokens. Consider implementing a different retry mechanism.');
    return;
    
    // Original implementation commented out due to token issues
    /*
    try {
      const stuckPurchases = await prisma.purchase.findMany({
        where: {
          status: 'PENDING', // Changed from PROCESSING
          createdAt: {
            lt: new Date(Date.now() - 10 * 60 * 1000) // Older than 10 minutes
          }
        },
        include: {
          items: true
        }
      });

      console.log(`Found ${stuckPurchases.length} stuck purchases to retry`);
      // ... rest would need token management
    } catch (error) {
      console.error('Error in retryFailedEnrollments:', error);
    }
    */
  }

  async getPaymentStatus(paymentIntentId, userId) {
    try {
      // Get from database
      const purchase = await prisma.purchase.findUnique({
        where: { paymentIntentId },
        include: {
          items: true
        }
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Verify user owns this purchase
      if (purchase.userId !== userId) {
        throw new Error('Unauthorized access to payment information');
      }

      // Also get fresh data from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntentId,
        status: paymentIntent.status,
        purchaseStatus: purchase.status,
        amount: parseFloat(purchase.amount),
        currency: purchase.currency,
        created: purchase.createdAt,
        completedAt: purchase.completedAt,
        failedAt: purchase.failedAt,
        error: purchase.errorMessage,
        items: purchase.items.map(item => ({
          courseId: item.courseId,
          price: parseFloat(item.price)
        }))
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // Get user's purchase history
  async getUserPurchases(userId, limit = 20, offset = 0) {
    try {
      const purchases = await prisma.purchase.findMany({
        where: { userId },
        include: {
          items: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      return purchases.map(purchase => ({
        id: purchase.id,
        paymentIntentId: purchase.paymentIntentId,
        amount: parseFloat(purchase.amount),
        currency: purchase.currency,
        status: purchase.status,
        createdAt: purchase.createdAt,
        completedAt: purchase.completedAt,
        items: purchase.items.map(item => ({
          courseId: item.courseId,
          price: parseFloat(item.price)
        }))
      }));
    } catch (error) {
      console.error('Error getting user purchases:', error);
      throw error;
    }
  }

  // Helper methods
  isRetryableError(error) {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      (error.response && error.response.status >= 500)
    );
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manual admin function to handle stuck purchases
  // Note: This also has token issues for retry_enrollment
  async handleStuckPurchase(paymentIntentId, action) {
    try {
      const purchase = await prisma.purchase.findUnique({
        where: { paymentIntentId },
        include: { items: true }
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      switch (action) {
        case 'retry_enrollment':
          // This would need a token to work properly
          console.warn('retry_enrollment requires a valid token for the course service');
          return { success: false, message: 'Token required for enrollment retry' };

        case 'force_refund':
          await this.handleEnrollmentFailure(paymentIntentId, 'Manual refund requested');
          return { success: true, message: 'Refund initiated' };

        case 'mark_completed':
          await prisma.purchase.update({
            where: { paymentIntentId },
            data: { status: 'COMPLETED', completedAt: new Date() }
          });
          return { success: true, message: 'Purchase marked as completed' };

        default:
          throw new Error('Invalid action');
      }
    } catch (error) {
      console.error('Error handling stuck purchase:', error);
      throw error;
    }
  }
}

module.exports = PurchaseService;