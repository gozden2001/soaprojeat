const express = require('express');
const router = express.Router();
const followService = require('../services/followService');
const { authMiddleware } = require('../middleware/auth');
const { validateFollowUser } = require('../validators/followValidators');

// POST /api/follows - Follow a user (requires authentication)
router.post('/', authMiddleware, validateFollowUser, async (req, res) => {
  try {
    const { followingId, followingUsername } = req.body;
    
    const result = await followService.followUser(
      req.user.id,
      req.user.username,
      followingId,
      followingUsername
    );
    
    if (result.success) {
      res.status(201).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/follows/:userId - Unfollow a user (requires authentication)
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await followService.unfollowUser(req.user.id, userId);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/follows/:userId/followers - Get followers of a user
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await followService.getFollowers(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/follows/:userId/following - Get users that a user is following
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await followService.getFollowing(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/follows/:userId/mutual - Get mutual follows for a user
router.get('/:userId/mutual', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await followService.getMutualFollows(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get mutual follows error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/follows/:userId/stats - Get follow statistics for a user
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await followService.getFollowStats(userId);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get follow stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/follows/check/:userId - Check if current user follows another user
router.get('/check/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await followService.isFollowing(req.user.id, userId);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;