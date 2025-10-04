const express = require('express');
const router = express.Router();
const tourKeyPointService = require('../services/tourKeyPointService');
const { authMiddleware } = require('../middleware/auth');
const {
  validateCreateKeyPoint,
  validateUpdateKeyPoint,
  validateReorderKeyPoints,
  validateQueryParams
} = require('../validators/tourKeyPointValidators');

// POST /api/tours/:tourId/keypoints - Create a new key point for a tour
router.post('/:tourId/keypoints', authMiddleware, validateCreateKeyPoint, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    
    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }
    
    const result = await tourKeyPointService.createKeyPoint(tourId, req.body, req.user.id);
    
    if (result.success) {
      res.status(201).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Create key point error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/:tourId/keypoints - Get all key points for a tour
router.get('/:tourId/keypoints', validateQueryParams, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    
    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }
    
    const result = await tourKeyPointService.getKeyPointsByTour(tourId, req.query);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get key points error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tours/:tourId/keypoints/stats - Get key points statistics for a tour
router.get('/:tourId/keypoints/stats', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    
    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }
    
    const result = await tourKeyPointService.getKeyPointStats(tourId);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get key point stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/keypoints/:id - Get a specific key point by ID
router.get('/keypoints/:id', async (req, res) => {
  try {
    const keyPointId = parseInt(req.params.id);
    
    if (isNaN(keyPointId)) {
      return res.status(400).json({ message: 'Invalid key point ID' });
    }
    
    const result = await tourKeyPointService.getKeyPointById(keyPointId);
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    console.error('Get key point error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/keypoints/:id - Update a key point
router.put('/keypoints/:id', authMiddleware, validateUpdateKeyPoint, async (req, res) => {
  try {
    const keyPointId = parseInt(req.params.id);
    
    if (isNaN(keyPointId)) {
      return res.status(400).json({ message: 'Invalid key point ID' });
    }
    
    const result = await tourKeyPointService.updateKeyPoint(keyPointId, req.body, req.user.id);
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      const statusCode = result.error.includes('not found') ? 404 : 
                        result.error.includes('Access denied') ? 403 : 400;
      res.status(statusCode).json({ message: result.error });
    }
  } catch (error) {
    console.error('Update key point error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/keypoints/:id - Delete a key point
router.delete('/keypoints/:id', authMiddleware, async (req, res) => {
  try {
    const keyPointId = parseInt(req.params.id);
    
    if (isNaN(keyPointId)) {
      return res.status(400).json({ message: 'Invalid key point ID' });
    }
    
    const result = await tourKeyPointService.deleteKeyPoint(keyPointId, req.user.id);
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      const statusCode = result.error.includes('not found') ? 404 : 
                        result.error.includes('Access denied') ? 403 : 400;
      res.status(statusCode).json({ message: result.error });
    }
  } catch (error) {
    console.error('Delete key point error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/tours/:tourId/keypoints/reorder - Reorder key points for a tour
router.put('/:tourId/keypoints/reorder', authMiddleware, validateReorderKeyPoints, async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    
    if (isNaN(tourId)) {
      return res.status(400).json({ message: 'Invalid tour ID' });
    }
    
    const result = await tourKeyPointService.reorderKeyPoints(
      tourId, 
      req.body.keyPointOrders, 
      req.user.id
    );
    
    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      const statusCode = result.error.includes('not found') ? 404 : 
                        result.error.includes('Access denied') ? 403 : 400;
      res.status(statusCode).json({ message: result.error });
    }
  } catch (error) {
    console.error('Reorder key points error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;