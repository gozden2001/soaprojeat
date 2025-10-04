import axios from '../utils/axiosInstance';

const cartAPI = {
  // Get shopping cart
  getCart: async () => {
    try {
      const response = await axios.get('/api/cart');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get cart'
      };
    }
  },

  // Add tour to cart
  addToCart: async (tourId) => {
    try {
      const response = await axios.post('/api/cart/add', { tourId });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add tour to cart'
      };
    }
  },

  // Remove tour from cart
  removeFromCart: async (tourId) => {
    try {
      const response = await axios.delete('/api/cart/remove', { 
        data: { tourId } 
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove tour from cart'
      };
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await axios.delete('/api/cart/clear');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to clear cart'
      };
    }
  },

  // Get checkout summary
  getCheckoutSummary: async () => {
    try {
      const response = await axios.get('/api/cart/checkout/summary');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get checkout summary'
      };
    }
  },

  // Process checkout
  checkout: async () => {
    try {
      const response = await axios.post('/api/cart/checkout');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to process checkout'
      };
    }
  },

  // Get purchase history
  getPurchaseHistory: async () => {
    try {
      const response = await axios.get('/api/cart/purchases');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get purchase history'
      };
    }
  },

  // Check tour ownership
  checkTourOwnership: async (tourId) => {
    try {
      const response = await axios.get(`/api/cart/purchases/check/${tourId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check tour ownership'
      };
    }
  },

  // Validate purchase token
  validatePurchaseToken: async (tourId) => {
    try {
      const response = await axios.get(`/api/cart/validate/${tourId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to validate purchase token'
      };
    }
  }
};

export default cartAPI;