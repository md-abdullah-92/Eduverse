
// controllers/purchaseController.js
const PurchaseService = require('../services/purchaseService');
const { asyncHandler } = require('../utils/asyncHandler');

class PurchaseController {
  constructor() {
    this.purchaseService = new PurchaseService();
  }

  createPaymentIntent = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { amount, currency = 'tk', metadata = {} } = req.body;

    const paymentIntent = await this.purchaseService.createPaymentIntent({
      userId,
      amount,
      currency,
      metadata
    });

    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  });

  confirmPayment = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { paymentIntentId } = req.body;
    const token = req.headers.authorization.split(" ")[1];

    const result = await this.purchaseService.confirmPayment({
      userId,
      paymentIntentId,
      token
    });

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: result
    });
  });

  getPaymentStatus = asyncHandler(async (req, res) => {
    const { id: paymentIntentId } = req.params;
    const userId = req.user.id;

    const status = await this.purchaseService.getPaymentStatus(paymentIntentId, userId);

    res.status(200).json({
      success: true,
      data: status
    });
  });
}

module.exports = new PurchaseController();
