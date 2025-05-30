const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../lib/prisma');
const CartService = require('./cartService');
const EventService = require('./eventService');

class PurchaseService {
  constructor() {
    this.cartService = new CartService();
    this.eventService = new EventService();
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
        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
          // Update purchase record
          const purchase = await tx.purchase.update({
            where: { paymentIntentId },
            data: {
              status: 'COMPLETED',
              paymentMethodId,
              completedAt: new Date()
            }
          });

          // Get user's cart
          const cart = await tx.cart.findFirst({
            where: { userId },
            include: {
              items: {
                include: {
                  course: true
                }
              }
            }
          });

          if (cart && cart.items.length > 0) {
            // Create purchase items
            const purchaseItems = cart.items.map(item => ({
              purchaseId: purchase.id,
              courseId: item.courseId,
              price: item.course.price
            }));

            await tx.purchaseItem.createMany({
              data: purchaseItems
            });

            // Create enrollments
            const enrollments = cart.items.map(item => ({
              userId,
              courseId: item.courseId,
              purchaseId: purchase.id
            }));

            await tx.enrollment.createMany({
              data: enrollments,
              skipDuplicates: true
            });

            // Clear cart
            await tx.cartItem.deleteMany({
              where: { cartId: cart.id }
            });

            await tx.cart.update({
              where: { id: cart.id },
              data: { subtotal: 0, tax: 0, total: 0 }
            });

            return {
              purchase,
              enrollments: cart.items.map(item => ({
                courseId: item.courseId,
                title: item.course.title
              }))
            };
          }

          return { purchase, enrollments: [] };
        });

        // Emit enrollment events
        for (const enrollment of result.enrollments) {
          await this.eventService.emitEnrollmentEvent({
            userId,
            courseId: enrollment.courseId,
            purchaseId: paymentIntentId,
            price: result.purchase.amount
          });
        }

        return {
          paymentIntentId,
          status: 'completed',
          enrollments: result.enrollments
        };
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Update purchase record with error
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

  async getPaymentStatus(paymentIntentId, userId) {
    try {
      // Get from database
      const purchase = await prisma.purchase.findUnique({
        where: { paymentIntentId },
        include: {
          items: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          }
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
        amount: parseFloat(purchase.amount),
        currency: purchase.currency,
        created: purchase.createdAt,
        completedAt: purchase.completedAt,
        failedAt: purchase.failedAt,
        error: purchase.errorMessage,
        items: purchase.items.map(item => ({
          courseId: item.courseId,
          title: item.course.title,
          price: parseFloat(item.price)
        }))
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

module.exports = PurchaseService;