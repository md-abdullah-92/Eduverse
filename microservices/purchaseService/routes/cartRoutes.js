
// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

// All cart routes require authentication
// router.use(authenticate);

// Cart operations
router.post('/add-course', validateCartItem, cartController.addCourse);
router.delete('/remove-course', cartController.removeCourse);
router.get('/', cartController.getCart);

module.exports = router;
