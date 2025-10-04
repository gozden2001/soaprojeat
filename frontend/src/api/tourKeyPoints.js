import axios from '../utils/axiosInstance';

const tourKeyPointAPI = {
  // Create a new key point for a tour
  createKeyPoint: async (tourId, keyPointData) => {
    try {
      const response = await axios.post(`/api/tours/${tourId}/keypoints`, keyPointData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create key point'
      };
    }
  },

  // Get all key points for a tour
  getKeyPointsByTour: async (tourId, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/tours/${tourId}/keypoints?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch key points'
      };
    }
  },

  // Get key points statistics for a tour
  getKeyPointStats: async (tourId) => {
    try {
      const response = await axios.get(`/api/tours/${tourId}/keypoints/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch key point statistics'
      };
    }
  },

  // Get a specific key point by ID
  getKeyPointById: async (keyPointId) => {
    try {
      const response = await axios.get(`/api/keypoints/${keyPointId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch key point'
      };
    }
  },

  // Update a key point
  updateKeyPoint: async (keyPointId, updateData) => {
    try {
      const response = await axios.put(`/api/keypoints/${keyPointId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update key point'
      };
    }
  },

  // Delete a key point
  deleteKeyPoint: async (keyPointId) => {
    try {
      const response = await axios.delete(`/api/keypoints/${keyPointId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete key point'
      };
    }
  },

  // Reorder key points for a tour
  reorderKeyPoints: async (tourId, keyPointOrders) => {
    try {
      const response = await axios.put(`/api/tours/${tourId}/keypoints/reorder`, {
        keyPointOrders
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reorder key points'
      };
    }
  }
};

export default tourKeyPointAPI;