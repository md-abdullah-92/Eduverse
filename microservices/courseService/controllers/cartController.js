const prisma = require('../prismaClient');

const cartController = {
  // Get cart with items (PROTECTED)
  getCart: async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = String(req.user.id);

      // Authorization: User can only access their own cart OR admin can access any
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this cart'
        });
      }

      const cart = await prisma.cart.upsert({
        where: { studentId },
        update: {},
        create: { studentId },
        include: {
          items: {
            include: {
              course: true
            }
          }
        }
      });

      const items = cart.items;
      const total = items.reduce((sum, item) => sum + item.course.price, 0);

      res.json({
        success: true,
        data: {
          studentId,
          items,
          total,
          itemCount: items.length
        }
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cart'
      });
    }
  },

  // Add course to cart (PROTECTED)
  addToCart: async (req, res) => {
    try {
      const { studentId } = req.params;
      const { courseId } = req.body;
      const userId = String(req.user.id);

      // Authorization check
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this cart'
        });
      }

      // Input validation
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: 'Course ID is required'
        });
      }

      const courseIdInt = parseInt(courseId);
      if (isNaN(courseIdInt) || courseIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid course ID is required'
        });
      }

      // Check course exists, student isn't enrolled, and item not in cart
      const [course, enrollment, existingCartItem] = await Promise.all([
        prisma.course.findUnique({
          where: { id: courseIdInt }
        }),
        prisma.enrollment.findFirst({
          where: { studentId, courseId: courseIdInt }
        }),
        prisma.cartItem.findUnique({
          where: {
            studentId_courseId: { studentId, courseId: courseIdInt }
          }
        })
      ]);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      if (enrollment) {
        return res.status(409).json({
          success: false,
          message: 'You are already enrolled in this course'
        });
      }

      if (existingCartItem) {
        return res.status(409).json({
          success: false,
          message: 'Course is already in your cart'
        });
      }

      // Ensure cart exists and add item
      await prisma.cart.upsert({
        where: { studentId },
        update: {},
        create: { studentId }
      });

      const cartItem = await prisma.cartItem.create({
        data: {
          studentId,
          courseId: courseIdInt
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              coverPhotoUrl: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: cartItem,
        message: 'Course added to cart successfully'
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add course to cart'
      });
    }
  },

  // Remove course from cart (PROTECTED)
  removeFromCart: async (req, res) => {
    try {
      const { studentId, courseId } = req.params;
      const userId = String(req.user.id);

      // Authorization check
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this cart'
        });
      }

      const courseIdInt = parseInt(courseId);
      if (isNaN(courseIdInt) || courseIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid course ID is required'
        });
      }

      const deleted = await prisma.cartItem.deleteMany({
        where: {
          studentId,
          courseId: courseIdInt
        }
      });

      if (deleted.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found in cart'
        });
      }

      res.json({
        success: true,
        message: 'Course removed from cart successfully'
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove course from cart'
      });
    }
  },

  // Clear entire cart (PROTECTED)
  clearCart: async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = String(req.user.id);

      // Authorization check
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to modify this cart'
        });
      }

      await prisma.cartItem.deleteMany({
        where: { studentId }
      });

      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart'
      });
    }
  },

  // Get cart item count (PROTECTED)
  getCartCount: async (req, res) => {
    try {
      const { studentId } = req.params;
      const userId = String(req.user.id);

      // Authorization check
      if (userId !== studentId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this cart'
        });
      }

      const count = await prisma.cartItem.count({
        where: { studentId }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error getting cart count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cart count'
      });
    }
  },

  applyPromoCode: async (req, res) => {
    // Implementation here
    res.status(501).json({
      success: false,
      message: 'Promo code functionality not implemented yet'
    });
  }

};

module.exports = cartController;