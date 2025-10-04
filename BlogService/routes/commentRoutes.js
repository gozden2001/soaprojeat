const express = require('express');
const router = express.Router();
const commentService = require('../services/commentService');
const blogService = require('../services/blogService');
const { authMiddleware } = require('../middleware/auth');
const { validateCreateComment, validateUpdateComment } = require('../validators/followValidators');

// POST /api/comments/:blogId - Create comment on a blog (requires authentication and following)
router.post('/:blogId', authMiddleware, validateCreateComment, async (req, res) => {
  try {
    const { blogId } = req.params;
    
    // First get the blog to find the author
    const blogResult = await blogService.getBlogById(blogId);
    if (!blogResult.success) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const blogAuthorId = blogResult.data.author.userId;
    
    const result = await commentService.createComment(
      blogId,
      req.body,
      req.user.id,
      req.user.username,
      req.user.role,
      blogAuthorId
    );
    
    if (result.success) {
      res.status(201).json({
        message: result.message,
        comment: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/comments/:blogId - Get comments for a blog
router.get('/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await commentService.getCommentsByBlog(blogId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/comments/comment/:commentId - Update a comment (requires authentication and ownership)
router.put('/comment/:commentId', authMiddleware, validateUpdateComment, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const result = await commentService.updateComment(commentId, req.body, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        comment: result.data
      });
    } else {
      const status = result.error.includes('not found') ? 404 : 
                   result.error.includes('only edit') ? 403 : 400;
      res.status(status).json({ message: result.error });
    }
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/comments/comment/:commentId - Delete a comment (requires authentication and ownership)
router.delete('/comment/:commentId', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const result = await commentService.deleteComment(commentId, req.user.id);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      const status = result.error.includes('not found') ? 404 : 
                   result.error.includes('only delete') ? 403 : 400;
      res.status(status).json({ message: result.error });
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/comments/user/:userId - Get comments by a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await commentService.getCommentsByUser(userId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/comments/stats - Get comment statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await commentService.getCommentStats();
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get comment stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;