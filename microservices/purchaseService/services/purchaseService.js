
// services/purchaseService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const CartService = require('./cartService');
const EventService = require('./eventService');
const { v4: uuidv4 } = require('uuid');

class PurchaseService {
  constructor() {
    this.cartService = new CartService();
    this.eventService = new EventService();
    // In-memory storage for demo purposes
    this.purchases = new Map();
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

      // Store payment intent locally
      this.purchases.set(paymentIntent.id, {
        id: paymentIntent.id,
        userId,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
        metadata
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
        // Update local purchase record
        const purchase = this.purchases.get(paymentIntentId);
        if (purchase) {
          purchase.status = 'completed';
          purchase.completedAt = new Date().toISOString();
          purchase.paymentMethodId = paymentMethodId;
        }

        // Get user's cart for enrollment
        const cart = await this.cartService.getCart(userId);
        
        // Emit enrollment events for each course
        for (const item of cart.items) {
          await this.eventService.emitEnrollmentEvent({
            userId,
            courseId: item.courseId,
            purchaseId: paymentIntentId,
            price: item.price
          });
        }

        // Clear the cart after successful payment
        await this.cartService.clearCart(userId);

        return {
          paymentIntentId,
          status: 'completed',
          enrollments: cart.items.map(item => ({
            courseId: item.courseId,
            title: item.title
          }))
        };
      } else {
        throw new Error(`Payment failed with status: ${paymentIntent.status}`);
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      
      // Update local purchase record with error
      const purchase = this.purchases.get(paymentIntentId);
      if (purchase) {
        purchase.status = 'failed';
        purchase.error = error.message;
        purchase.failedAt = new Date().toISOString();
      }
      
      throw error;
    }
  }

  async getPaymentStatus(paymentIntentId, userId) {
    try {
      // Get from local storage first
      const localPurchase = this.purchases.get(paymentIntentId);
      
      // Also get fresh data from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // Verify user owns this payment intent
      if (localPurchase && localPurchase.userId !== userId) {
        throw new Error('Unauthorized access to payment information');
      }

      return {
        id: paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back from cents
        currency: paymentIntent.currency,
        created: new Date(paymentIntent.created * 1000).toISOString(),
        ...(localPurchase && {
          completedAt: localPurchase.completedAt,
          failedAt: localPurchase.failedAt,
          error: localPurchase.error
        })
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

module.exports = PurchaseService;