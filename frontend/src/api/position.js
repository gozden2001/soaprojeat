import axios from '../utils/axiosInstance';

const positionAPI = {
  // Get current user position
  getCurrentPosition: async () => {
    try {
      const response = await axios.get('/api/auth/user/position');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: true,
          data: { latitude: null, longitude: null }
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get current position'
      };
    }
  },

  // Set current user position
  setCurrentPosition: async (latitude, longitude) => {
    try {
      const response = await axios.put('/api/auth/user/position', {
        latitude,
        longitude
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to set position'
      };
    }
  }
};

export default positionAPI;