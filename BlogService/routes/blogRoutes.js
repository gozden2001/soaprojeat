const express = require('express');
const router = express.Router();
const blogService = require('../services/blogService');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/blogs - Get all blogs with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tags = req.query.tags ? req.query.tags.split(',') : null;

    const result = await blogService.getAllBlogs(page, limit, tags);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/search - Search blogs
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await blogService.searchBlogs(searchTerm, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Search blogs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/stats - Get blog statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await blogService.getBlogStats();
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get blog stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/author/:authorId - Get blogs by author
router.get('/author/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await blogService.getBlogsByAuthor(authorId, page, limit);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get blogs by author error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/blogs/:id - Get specific blog by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.getBlogById(id);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/blogs - Create new blog (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      authorUsername: req.user.username,
      authorRole: req.user.role
    };
    
    const result = await blogService.createBlog(blogData, req.user.id);
    
    if (result.success) {
      res.status(201).json({
        message: result.message,
        blog: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/blogs/:id - Update blog (requires authentication, author only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await blogService.updateBlog(id, updateData, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        blog: result.data
      });
    } else {
      const status = result.error.includes('Unauthorized') ? 403 : 
                   result.error.includes('not found') ? 404 : 400;
      res.status(status).json({ message: result.error });
    }
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/blogs/:id - Delete blog (requires authentication, author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await blogService.deleteBlog(id, req.user.id);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      const status = result.error.includes('Unauthorized') ? 403 : 
                   result.error.includes('not found') ? 404 : 400;
      res.status(status).json({ message: result.error });
    }
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;