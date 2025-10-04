const express = require('express');
const router = express.Router();
const tourService = require('../services/tourService');
const { authMiddleware, requireRole, requireTourOwnership } = require('../middleware/auth');
const { validateCreateTour, validateUpdateTour, validateListTours } = require('../validators/tourValidators');

// GET /api/tours - Get all tours (public with filtering)
router.get('/', validateListTours, async (req, res) => {
  try {
    const result = await tourService.getAllTours(req.query);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/stats - Get tour statistics
router.get('/stats', async (req, res) => {
  try {
    const result = await tourService.getTourStats();
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get tour stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/my - Get current user's tours (requires authentication)
router.get('/my', authMiddleware, validateListTours, async (req, res) => {
  try {
    const result = await tourService.getToursByAuthor(req.user.id, req.query);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get my tours error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/author/:authorId - Get tours by specific author
router.get('/author/:authorId', validateListTours, async (req, res) => {
  try {
    const authorId = parseInt(req.params.authorId);
    
    if (isNaN(authorId)) {
      return res.status(400).json({ message: 'Invalid author ID' });
    }
    
    const result = await tourService.getToursByAuthor(authorId, req.query);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get tours by author error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/search/tags - Search tours by tags
router.get('/search/tags', validateListTours, async (req, res) => {
  try {
    const { tags, ...options } = req.query;
    
    if (!tags) {
      return res.status(400).json({ message: 'Tags parameter is required' });
    }
    
    const result = await tourService.searchToursByTags(tags, options);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Search tours by tags error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/tours - Create new tour (requires authentication, vodic role)
router.post('/', authMiddleware, requireRole(['vodic', 'administrator']), validateCreateTour, async (req, res) => {
  try {
    const result = await tourService.createTour(req.body, req.user);
    
    if (result.success) {
      res.status(201).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/:id - Get tour by ID
router.get('/:id', async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    
    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }
    
    const result = await tourService.getTourById(tourId);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/tours/:id - Update tour (requires authentication and ownership)
router.put('/:id', authMiddleware, requireTourOwnership, validateUpdateTour, async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    
    const result = await tourService.updateTour(tourId, req.body, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/tours/:id - Delete tour (requires authentication and ownership)
router.delete('/:id', authMiddleware, requireTourOwnership, async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    
    const result = await tourService.deleteTour(tourId, req.user.id);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/tours/:id/publish - Publish tour (requires authentication and ownership)
router.patch('/:id/publish', authMiddleware, requireTourOwnership, async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    
    const result = await tourService.publishTour(tourId, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Publish tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/tours/:id/archive - Archive tour (requires authentication and ownership)
router.patch('/:id/archive', authMiddleware, requireTourOwnership, async (req, res) => {
  try {
    const tourId = parseInt(req.params.id);
    
    const result = await tourService.archiveTour(tourId, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Archive tour error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;