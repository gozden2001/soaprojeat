const Follow = require('../models/follow');

class FollowService {
  
  // Follow a user
  async followUser(followerId, followerUsername, followingId, followingUsername) {
    try {
      // Check if user is trying to follow themselves
      if (followerId === followingId) {
        return {
          success: false,
          error: 'Cannot follow yourself'
        };
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        'follower.userId': followerId,
        'following.userId': followingId
      });

      if (existingFollow) {
        return {
          success: false,
          error: 'Already following this user'
        };
      }

      // Create follow relationship
      const follow = new Follow({
        follower: {
          userId: followerId,
          username: followerUsername
        },
        following: {
          userId: followingId,
          username: followingUsername
        }
      });

      await follow.save();

      return {
        success: true,
        message: `You are now following ${followingUsername}`,
        data: follow
      };

    } catch (error) {
      console.error('Follow user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    try {
      const result = await Follow.findOneAndDelete({
        'follower.userId': followerId,
        'following.userId': followingId
      });

      if (!result) {
        return {
          success: false,
          error: 'Follow relationship not found'
        };
      }

      return {
        success: true,
        message: `You have unfollowed ${result.following.username}`
      };

    } catch (error) {
      console.error('Unfollow user error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get followers of a user
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const followers = await Follow.find({ 'following.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('follower createdAt -_id');

      const total = await Follow.countDocuments({ 'following.userId': userId });
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          followers: followers.map(f => f.follower),
          pagination: {
            currentPage: page,
            totalPages,
            totalFollowers: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get followers error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get users that a user is following
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const following = await Follow.find({ 'follower.userId': userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('following createdAt -_id');

      const total = await Follow.countDocuments({ 'follower.userId': userId });
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          following: following.map(f => f.following),
          pagination: {
            currentPage: page,
            totalPages,
            totalFollowing: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get following error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if user A follows user B
  async isFollowing(followerId, followingId) {
    try {
      const follow = await Follow.findOne({
        'follower.userId': followerId,
        'following.userId': followingId
      });

      return {
        success: true,
        data: {
          isFollowing: !!follow
        }
      };

    } catch (error) {
      console.error('Check follow status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get follow statistics for a user
  async getFollowStats(userId) {
    try {
      const [followersCount, followingCount] = await Promise.all([
        Follow.countDocuments({ 'following.userId': userId }),
        Follow.countDocuments({ 'follower.userId': userId })
      ]);

      return {
        success: true,
        data: {
          followers: followersCount,
          following: followingCount
        }
      };

    } catch (error) {
      console.error('Get follow stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get mutual follows (users who follow each other)
  async getMutualFollows(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      // Find users that the current user follows
      const following = await Follow.find({ 'follower.userId': userId })
        .select('following.userId');
      
      const followingIds = following.map(f => f.following.userId);
      
      // Find which of those users also follow the current user back
      const mutualFollows = await Follow.find({
        'follower.userId': { $in: followingIds },
        'following.userId': userId
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('follower -_id');

      const total = await Follow.countDocuments({
        'follower.userId': { $in: followingIds },
        'following.userId': userId
      });
      
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          mutualFollows: mutualFollows.map(f => f.follower),
          pagination: {
            currentPage: page,
            totalPages,
            totalMutual: total,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get mutual follows error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new FollowService();