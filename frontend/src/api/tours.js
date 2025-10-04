import axios from '../utils/axiosInstance';

const tourAPI = {
  // Get all tours with pagination and filtering
  getAllTours: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Add filters
      if (filters.status) params.append('status', filters.status);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      if (filters.authorId) params.append('authorId', filters.authorId.toString());
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`/api/tours?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch tours'
      };
    }
  },

  // Get my tours (requires authentication)
  getMyTours: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // Add filters
      if (filters.status) params.append('status', filters.status);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`/api/tours/my?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch your tours'
      };
    }
  },

  // Get tour by ID
  getTourById: async (tourId) => {
    try {
      const response = await axios.get(`/api/tours/${tourId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch tour'
      };
    }
  },

  // Create new tour (requires authentication)
  createTour: async (tourData) => {
    try {
      const response = await axios.post('/api/tours', tourData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create tour'
      };
    }
  },

  // Update tour (requires authentication and ownership)
  updateTour: async (tourId, updateData) => {
    try {
      const response = await axios.put(`/api/tours/${tourId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update tour'
      };
    }
  },

  // Delete tour (requires authentication and ownership)
  deleteTour: async (tourId) => {
    try {
      const response = await axios.delete(`/api/tours/${tourId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete tour'
      };
    }
  },

  // Publish tour (requires authentication and ownership)
  publishTour: async (tourId, price) => {
    try {
      const response = await axios.patch(`/api/tours/${tourId}/publish`, { price });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to publish tour'
      };
    }
  },

  // Archive tour (requires authentication and ownership)
  archiveTour: async (tourId) => {
    try {
      const response = await axios.patch(`/api/tours/${tourId}/archive`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to archive tour'
      };
    }
  },

  // Get tour statistics
  getTourStats: async () => {
    try {
      const response = await axios.get('/api/tours/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch tour statistics'
      };
    }
  },

  // Search tours by tags
  searchToursByTags: async (tags, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        tags: Array.isArray(tags) ? tags.join(',') : tags
      });
      
      const response = await axios.get(`/api/tours/search/tags?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search tours'
      };
    }
  },

  // Get tours by author
  getToursByAuthor: async (authorId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/tours/author/${authorId}?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch author tours'
      };
    }
  },

  // Get tour key points
  getTourKeyPoints: async (tourId) => {
    try {
      const response = await axios.get(`/api/tours/${tourId}/keypoints`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch tour key points'
      };
    }
  }
};

export default tourAPI;