import axios from '../utils/axiosInstance';

const followAPI = {
  // Follow a user
  followUser: async (followingId, followingUsername) => {
    try {
      const response = await axios.post('/api/follows', {
        followingId,
        followingUsername
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to follow user'
      };
    }
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    try {
      const response = await axios.delete(`/api/follows/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to unfollow user'
      };
    }
  },

  // Get followers of a user
  getFollowers: async (userId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/follows/${userId}/followers?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch followers'
      };
    }
  },

  // Get users that a user is following
  getFollowing: async (userId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/follows/${userId}/following?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch following'
      };
    }
  },

  // Get mutual follows
  getMutualFollows: async (userId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await axios.get(`/api/follows/${userId}/mutual?${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch mutual follows'
      };
    }
  },

  // Check if current user follows another user
  checkFollowStatus: async (userId) => {
    try {
      const response = await axios.get(`/api/follows/check/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check follow status'
      };
    }
  },

  // Get follow statistics for a user
  getFollowStats: async (userId) => {
    try {
      const response = await axios.get(`/api/follows/${userId}/stats`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch follow stats'
      };
    }
  }
};

export default followAPI;