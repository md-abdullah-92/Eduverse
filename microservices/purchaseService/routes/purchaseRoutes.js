
// routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middleware/auth');
const { validatePaymentIntent, validatePaymentConfirmation } = require('../middleware/validation');

// All purchase routes require authentication
router.use(authenticate);

// Purchase operations
router.post('/create-payment-intent', validatePaymentIntent, purchaseController.createPaymentIntent);
router.post('/confirm-payment', validatePaymentConfirmation, purchaseController.confirmPayment);
router.get('/:id/status', purchaseController.getPaymentStatus);

module.exports = router;
