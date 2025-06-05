const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Helper method to get auth headers
const getAuthHeaders = () => {
  const storedToken = localStorage.getItem("token");
  return {
    'Content-Type': 'application/json',
    ...(storedToken && { Authorization: `Bearer ${storedToken}` })
  };
}

const cartService = {
  // Get user's cart
  getCart: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch cart');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add course to cart
  addToCart: async (studentId, courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Remove course from cart
  removeFromCart: async (studentId, courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}/${courseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }, 

  // Get cart count
  getCartCount: async (studentId)  => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}/count`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart count:', error);
      throw error;
    }
  },


  // Apply promo code
  applyPromoCode: async (studentId, promoCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${studentId}/promo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ promoCode })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying promo code:', error);
      throw error;
    }
  }
}

export default cartService;