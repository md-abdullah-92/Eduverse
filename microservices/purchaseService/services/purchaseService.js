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

  async confirmPayment({ userId, paymentIntentId, paymentMethodId }) {
    try {
      // Confirm the payment with Stripe
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      if (paymentIntent.status === 'succeeded') {
        // Update purchase to PROCESSING status first
        await prisma.purchase.update({
          where: { paymentIntentId },
          data: {
            status: 'PROCESSING',
            paymentMethodId,
          }
        });

        // try {
        //   // Get user's cart items from cart service
        //   const cartItems = await this.getCartItems(userId);
          
        //   if (!cartItems || cartItems.length === 0) {
        //     throw new Error('No items found in cart');
        //   }

        //   // Start database transaction for purchase completion
        //   const result = await prisma.$transaction(async (tx) => {
        //     // Update purchase record to completed
        //     const purchase = await tx.purchase.update({
        //       where: { paymentIntentId },
        //       data: {
        //         status: 'COMPLETED',
        //         completedAt: new Date()
        //       }
        //     });

        //     // Verify the purchase belongs to the user
        //     if (purchase.userId !== userId) {
        //       throw new Error('Unauthorized: Purchase does not belong to user');
        //     }

        //     // Create purchase items from cart
        //     const purchaseItems = cartItems.map(item => ({
        //       purchaseId: purchase.id,
        //       courseId: item.courseId,
        //       price: item.price
        //     }));

        //     await tx.purchaseItem.createMany({
        //       data: purchaseItems
        //     });

        //     return { purchase, cartItems };
        //   });

        //   // Create enrollments via course service
        //   const enrollmentResult = await this.createEnrollments(userId, cartItems, result.purchase.id);
          
        //   if (enrollmentResult.success) {
        //     // Clear user's cart
        //     await this.clearCart(userId);
            
        //     // Emit success events
        //     for (const item of cartItems) {
        //       await this.eventService.emitEnrollmentEvent({
        //         userId,
        //         courseId: item.courseId,
        //         purchaseId: paymentIntentId,
        //         price: item.price
        //       });
        //     }

        //     return {
        //       paymentIntentId,
        //       status: 'completed',
        //       enrollments: cartItems.map(item => ({
        //         courseId: item.courseId,
        //         price: item.price
        //       }))
        //     };
        //   } else {
        //     throw new Error(`Enrollment failed: ${enrollmentResult.error}`);
        //   }

        // } catch (enrollmentError) {
        //   console.error('Enrollment process failed:', enrollmentError);
          
        //   // Handle enrollment failure - refund and update status
        //   await this.handleEnrollmentFailure(paymentIntentId, enrollmentError.message);
          
        //   throw new Error(`Purchase completed but enrollment failed: ${enrollmentError.message}. Refund has been initiated.`);
        // }

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

  // async getCartItems(userId) {
  //   try {
  //     const response = await axios.get(`${this.courseServiceUrl}/api/cart/${userId}`, {
  //       timeout: this.httpTimeout,
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     });
      
  //     return response.data.items || [];
  //   } catch (error) {
  //     console.error('Error fetching cart items:', error);
  //     throw new Error('Failed to fetch cart items');
  //   }
  // }

  // async createEnrollments(userId, cartItems, purchaseId, retryCount = 0) {
  //   try {
  //     const enrollmentData = {
  //       userId,
  //       purchaseId,
  //       items: cartItems.map(item => ({
  //         courseId: item.courseId,
  //         price: item.price
  //       }))
  //     };

  //     const response = await axios.post(
  //       `${this.courseServiceUrl}/api/enrollments`,
  //       enrollmentData,
  //       {
  //         timeout: this.httpTimeout,
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );

  //     return { success: true, data: response.data };
  //   } catch (error) {
  //     console.error(`Enrollment attempt ${retryCount + 1} failed:`, error.message);
      
  //     // Retry logic for network errors
  //     if (retryCount < this.maxRetries && this.isRetryableError(error)) {
  //       console.log(`Retrying enrollment creation (attempt ${retryCount + 2})`);
  //       await this.delay(1000 * (retryCount + 1)); // Exponential backoff
  //       return this.createEnrollments(userId, cartItems, purchaseId, retryCount + 1);
  //     }
      
  //     return { 
  //       success: false, 
  //       error: error.response?.data?.message || error.message 
  //     };
  //   }
  // }

  // async clearCart(userId) {
  //   try {
  //     await axios.delete(`${this.courseServiceUrl}/api/cart/${userId}`, {
  //       timeout: this.httpTimeout
  //     });
  //   } catch (error) {
  //     console.error('Error clearing cart:', error);
  //     // Don't throw - cart clearing failure shouldn't fail the entire purchase
  //   }
  // }

  // async handleEnrollmentFailure(paymentIntentId, errorMessage) {
  //   try {
  //     // Initiate refund with Stripe
  //     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
  //     if (paymentIntent.charges.data.length > 0) {
  //       const charge = paymentIntent.charges.data[0];
  //       await stripe.refunds.create({
  //         charge: charge.id,
  //         reason: 'requested_by_customer'
  //       });
  //     }

  //     // Update purchase status
  //     await prisma.purchase.update({
  //       where: { paymentIntentId },
  //       data: {
  //         status: 'FAILED',
  //         errorMessage: `Enrollment failed: ${errorMessage}. Refund initiated.`,
  //         failedAt: new Date()
  //       }
  //     });

  //   } catch (refundError) {
  //     console.error('Error handling enrollment failure and refund:', refundError);
      
  //     // Mark for manual review if refund fails
  //     await prisma.purchase.update({
  //       where: { paymentIntentId },
  //       data: {
  //         status: 'FAILED',
  //         errorMessage: `Enrollment failed: ${errorMessage}. Refund failed: ${refundError.message}. Manual review required.`,
  //         failedAt: new Date()
  //       }
  //     }).catch(console.error);
  //   }
  // }

  // async retryFailedEnrollments() {
  //   try {
  //     // Find purchases that are stuck in PROCESSING status (enrollment might have failed)
  //     const stuckPurchases = await prisma.purchase.findMany({
  //       where: {
  //         status: 'PROCESSING',
  //         createdAt: {
  //           lt: new Date(Date.now() - 10 * 60 * 1000) // Older than 10 minutes
  //         }
  //       },
  //       include: {
  //         items: true
  //       }
  //     });

  //     console.log(`Found ${stuckPurchases.length} stuck purchases to retry`);

  //     for (const purchase of stuckPurchases) {
  //       try {
  //         console.log(`Retrying enrollment for purchase ${purchase.id}`);
          
  //         const cartItems = purchase.items.map(item => ({
  //           courseId: item.courseId,
  //           price: parseFloat(item.price)
  //         }));

  //         const enrollmentResult = await this.createEnrollments(
  //           purchase.userId, 
  //           cartItems, 
  //           purchase.id
  //         );

  //         if (enrollmentResult.success) {
  //           // Update to completed
  //           await prisma.purchase.update({
  //             where: { id: purchase.id },
  //             data: {
  //               status: 'COMPLETED',
  //               completedAt: new Date()
  //             }
  //           });

  //           // Clear cart and emit events
  //           await this.clearCart(purchase.userId);
            
  //           for (const item of cartItems) {
  //             await this.eventService.emitEnrollmentEvent({
  //               userId: purchase.userId,
  //               courseId: item.courseId,
  //               purchaseId: purchase.paymentIntentId,
  //               price: item.price
  //             });
  //           }

  //           console.log(`Successfully completed purchase ${purchase.id}`);
  //         } else {
  //           // Mark as failed and refund
  //           await this.handleEnrollmentFailure(
  //             purchase.paymentIntentId, 
  //             enrollmentResult.error
  //           );
  //           console.log(`Failed and refunded purchase ${purchase.id}`);
  //         }
  //       } catch (error) {
  //         console.error(`Error retrying purchase ${purchase.id}:`, error);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error in retryFailedEnrollments:', error);
  //   }
  // }

  async getPaymentStatus(paymentIntentId, userId) {
    try {
      // Get from database
      const purchase = await prisma.purchase.findUnique({
        where: { paymentIntentId },
        // include: {
        //   items: true
        // }
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
        // items: purchase.items.map(item => ({
        //   courseId: item.courseId,
        //   price: parseFloat(item.price)
        // }))
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
        // include: {
        //   items: true
        // },
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
        // items: purchase.items.map(item => ({
        //   courseId: item.courseId,
        //   price: parseFloat(item.price)
        // }))
      }));
    } catch (error) {
      console.error('Error getting user purchases:', error);
      throw error;
    }
  }

  // // Helper methods
  // isRetryableError(error) {
  //   // Retry on network errors, timeouts, and 5xx server errors
  //   return (
  //     error.code === 'ECONNREFUSED' ||
  //     error.code === 'ETIMEDOUT' ||
  //     error.code === 'ENOTFOUND' ||
  //     (error.response && error.response.status >= 500)
  //   );
  // }

  // delay(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  // // Manual admin function to handle stuck purchases
  // async handleStuckPurchase(paymentIntentId, action) {
  //   try {
  //     const purchase = await prisma.purchase.findUnique({
  //       where: { paymentIntentId },
  //       include: { items: true }
  //     });

  //     if (!purchase) {
  //       throw new Error('Purchase not found');
  //     }

  //     switch (action) {
  //       case 'retry_enrollment':
  //         const cartItems = purchase.items.map(item => ({
  //           courseId: item.courseId,
  //           price: parseFloat(item.price)
  //         }));
          
  //         const result = await this.createEnrollments(
  //           purchase.userId, 
  //           cartItems, 
  //           purchase.id
  //         );
          
  //         if (result.success) {
  //           await prisma.purchase.update({
  //             where: { paymentIntentId },
  //             data: { status: 'COMPLETED', completedAt: new Date() }
  //           });
  //           return { success: true, message: 'Enrollment completed successfully' };
  //         } else {
  //           return { success: false, message: result.error };
  //         }

  //       case 'force_refund':
  //         await this.handleEnrollmentFailure(paymentIntentId, 'Manual refund requested');
  //         return { success: true, message: 'Refund initiated' };

  //       case 'mark_completed':
  //         await prisma.purchase.update({
  //           where: { paymentIntentId },
  //           data: { status: 'COMPLETED', completedAt: new Date() }
  //         });
  //         return { success: true, message: 'Purchase marked as completed' };

  //       default:
  //         throw new Error('Invalid action');
  //     }
  //   } catch (error) {
  //     console.error('Error handling stuck purchase:', error);
  //     throw error;
  //   }
  // }
}

module.exports = PurchaseService;