// controllers/cartController.js
const CartService = require('../services/cartService');
const { asyncHandler } = require('../utils/asyncHandler');

class CartController {
  constructor() {
    this.cartService = new CartService();
  }

  addCourse = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const courseData = req.body;

    const cart = await this.cartService.addCourse(userId, courseData);
    
    res.status(200).json({
      success: true,
      message: 'Course added to cart',
      data: cart
    });
  });

  removeCourse = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        error: 'Course ID is required'
      });
    }

    const cart = await this.cartService.removeCourse(userId, courseId);
    
    res.status(200).json({
      success: true,
      message: 'Course removed from cart',
      data: cart
    });
  });

  getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cart = await this.cartService.getCart(userId);
    
    res.status(200).json({
      success: true,
      data: cart
    });
  });
}

module.exports = new CartController();
