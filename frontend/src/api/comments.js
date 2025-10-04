import axios from '../utils/axiosInstance';

const commentAPI = {
  // Create comment on a blog
  createComment: async (blogId, content) => {
    try {
      const response = await axios.post(`/api/comments/${blogId}`, {
        content
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create comment'
      };
    }
  },

  // Get comments for a blog
  getCommentsByBlog: async (blogId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/comments/${blogId}?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch comments'
      };
    }
  },

  // Update a comment
  updateComment: async (commentId, content) => {
    try {
      const response = await axios.put(`/api/comments/comment/${commentId}`, {
        content
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update comment'
      };
    }
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    try {
      const response = await axios.delete(`/api/comments/comment/${commentId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete comment'
      };
    }
  },

  // Get comments by a user
  getCommentsByUser: async (userId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/comments/user/${userId}?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user comments'
      };
    }
  },

  // Get comment statistics
  getCommentStats: async () => {
    try {
      const response = await axios.get('/api/comments/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch comment statistics'
      };
    }
  }
};

export default commentAPI;