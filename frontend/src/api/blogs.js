import axios from '../utils/axiosInstance';

const blogAPI = {
  // Get all blogs with pagination and filtering
  getAllBlogs: async (page = 1, limit = 10, tags = null) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (tags && tags.length > 0) {
        params.append('tags', tags.join(','));
      }
      
      const response = await axios.get(`/api/blogs?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch blogs'
      };
    }
  },

  // Get blog by ID
  getBlogById: async (blogId) => {
    try {
      const response = await axios.get(`/api/blogs/${blogId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch blog'
      };
    }
  },

  // Search blogs
  searchBlogs: async (searchTerm, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        q: searchTerm,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/blogs/search?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search blogs'
      };
    }
  },

  // Get blog statistics
  getBlogStats: async () => {
    try {
      const response = await axios.get('/api/blogs/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch blog statistics'
      };
    }
  },

  // Get blogs by author
  getBlogsByAuthor: async (authorId, page = 1, limit = 10) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/blogs/author/${authorId}?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch author blogs'
      };
    }
  },

  // Create new blog (requires authentication)
  createBlog: async (blogData) => {
    try {
      const response = await axios.post('/api/blogs', blogData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create blog'
      };
    }
  },

  // Update blog (requires authentication and ownership)
  updateBlog: async (blogId, updateData) => {
    try {
      const response = await axios.put(`/api/blogs/${blogId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update blog'
      };
    }
  },

  // Delete blog (requires authentication and ownership)
  deleteBlog: async (blogId) => {
    try {
      const response = await axios.delete(`/api/blogs/${blogId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete blog'
      };
    }
  }
};

export default blogAPI;