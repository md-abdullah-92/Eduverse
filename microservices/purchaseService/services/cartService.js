
// services/cartService.js
class CartService {
    constructor() {
      // In-memory storage for demo purposes
      // In production, use Redis or database
      this.carts = new Map();
    }
  
    async addCourse(userId, courseData) {
      const cart = this.getOrCreateCart(userId);
      
      // Check if course already exists in cart
      const existingCourse = cart.items.find(item => item.courseId === courseData.courseId);
      if (existingCourse) {
        throw new Error('Course already in cart');
      }
  
      // Add course to cart
      cart.items.push({
        ...courseData,
        addedAt: new Date().toISOString()
      });
  
      // Recalculate totals
      this.calculateTotals(cart);
      
      return cart;
    }
  
    async removeCourse(userId, courseId) {
      const cart = this.getOrCreateCart(userId);
      
      const initialLength = cart.items.length;
      cart.items = cart.items.filter(item => item.courseId !== courseId);
      
      if (cart.items.length === initialLength) {
        throw new Error('Course not found in cart');
      }
  
      // Recalculate totals
      this.calculateTotals(cart);
      
      return cart;
    }
  
    async getCart(userId) {
      return this.getOrCreateCart(userId);
    }
  
    async clearCart(userId) {
      const cart = this.getOrCreateCart(userId);
      cart.items = [];
      cart.subtotal = 0;
      cart.tax = 0;
      cart.total = 0;
      return cart;
    }
  
    getOrCreateCart(userId) {
      if (!this.carts.has(userId)) {
        this.carts.set(userId, {
          userId,
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      const cart = this.carts.get(userId);
      cart.updatedAt = new Date().toISOString();
      return cart;
    }
  
    calculateTotals(cart) {
      cart.subtotal = cart.items.reduce((sum, item) => sum + item.price, 0);
      cart.tax = cart.subtotal * (parseFloat(process.env.TAX_RATE) || 0.08);
      cart.total = cart.subtotal + cart.tax;
      
      // Round to 2 decimal places
      cart.subtotal = Math.round(cart.subtotal * 100) / 100;
      cart.tax = Math.round(cart.tax * 100) / 100;
      cart.total = Math.round(cart.total * 100) / 100;
    }
  }
  
  module.exports = CartService;
  
  