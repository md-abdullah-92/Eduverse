const prisma = require('../lib/prisma');

class CartService {
  async addCourse(userId, courseData) {
    try {
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseData.courseId }
      });

      if (!course) {
        throw new Error('Course not found');
      }

      // Get or create cart
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              course: true
            }
          }
        }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                course: true
              }
            }
          }
        });
      }

      // Check if course already in cart
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          cartId_courseId: {
            cartId: cart.id,
            courseId: courseData.courseId
          }
        }
      });

      if (existingItem) {
        throw new Error('Course already in cart');
      }

      // Add course to cart
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          courseId: courseData.courseId
        }
      });

      // Recalculate totals and return updated cart
      return await this.calculateAndUpdateTotals(cart.id);
    } catch (error) {
      console.error('Error adding course to cart:', error);
      throw error;
    }
  }

  async removeCourse(userId, courseId) {
    try {
      const cart = await prisma.cart.findFirst({
        where: { userId }
      });

      if (!cart) {
        throw new Error('Cart not found');
      }

      // Remove course from cart
      const deletedItem = await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          courseId: courseId
        }
      });

      if (deletedItem.count === 0) {
        throw new Error('Course not found in cart');
      }

      // Recalculate totals and return updated cart
      return await this.calculateAndUpdateTotals(cart.id);
    } catch (error) {
      console.error('Error removing course from cart:', error);
      throw error;
    }
  }

  async getCart(userId) {
    try {
      let cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              course: true
            }
          }
        }
      });

      if (!cart) {
        // Create empty cart if doesn't exist
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                course: true
              }
            }
          }
        });
      }

      return this.formatCartResponse(cart);
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const cart = await prisma.cart.findFirst({
        where: { userId }
      });

      if (cart) {
        // Delete all cart items
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });

        // Update cart totals
        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            subtotal: 0,
            tax: 0,
            total: 0
          }
        });
      }

      return await this.getCart(userId);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  async calculateAndUpdateTotals(cartId) {
    try {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              course: true
            }
          }
        }
      });

      const subtotal = cart.items.reduce((sum, item) => {
        return sum + parseFloat(item.course.price);
      }, 0);

      const taxRate = parseFloat(process.env.TAX_RATE) || 0.08;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      // Update cart with new totals
      const updatedCart = await prisma.cart.update({
        where: { id: cartId },
        data: {
          subtotal: subtotal,
          tax: tax,
          total: total
        },
        include: {
          items: {
            include: {
              course: true
            }
          }
        }
      });

      return this.formatCartResponse(updatedCart);
    } catch (error) {
      console.error('Error calculating cart totals:', error);
      throw error;
    }
  }

  formatCartResponse(cart) {
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(item => ({
        courseId: item.course.id,
        title: item.course.title,
        price: parseFloat(item.course.price),
        instructor: item.course.instructor,
        imageUrl: item.course.imageUrl,
        addedAt: item.addedAt
      })),
      subtotal: parseFloat(cart.subtotal),
      tax: parseFloat(cart.tax),
      total: parseFloat(cart.total),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }
}

module.exports = CartService;