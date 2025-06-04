const express = require('express');
const CartController = require('../controllers/cartController.js');
const { protect, authorize } = require('../middleware/auth.js');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('STUDENT'));

router.get('/:studentId', CartController.getCart);        // GET /api/cart/:studentId - Get user's cart
router.post('/:studentId', CartController.addToCart);      // POST /api/cart/:studentId - Add course to cart
router.delete('/:studentId/:courseId', CartController.removeFromCart);  // DELETE /api/cart/:studentId/:courseId - Remove specific course from cart
router.delete('/:studentId', CartController.clearCart);       // DELETE /api/cart/:studentId - Clear entire cart
router.get('/:studentId/count', CartController.getCartCount);  // GET /api/cart/:studentId/count - Get cart item count
router.post('/:studentId/promo', CartController.applyPromoCode);  // POST /api/cart/:studentId/promo - Apply promo code

module.exports = router;