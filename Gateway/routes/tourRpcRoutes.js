const express = require('express');
const router = express.Router();
const GrpcClients = require('../grpc/grpcClients');
const { authenticateToken } = require('../middleware/auth');

// Create tour via gRPC
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('[Gateway] gRPC tour creation request from user:', req.user.userId);
    console.log('[Gateway] Tour data:', JSON.stringify(req.body, null, 2));
    
    const tourData = req.body;
    const authorId = req.user.userId;

    const response = await GrpcClients.createTour(tourData, authorId);

    if (response.success) {
      res.status(201).json({
        message: 'Tour created successfully via gRPC',
        data: {
          id: response.tourId,
          status: response.status,
          name: tourData.name,
          authorId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.message
      });
    }
  } catch (error) {
    console.error('gRPC tour creation error:', error);
    
    if (error.code === 3) { // INVALID_ARGUMENT
      res.status(400).json({
        success: false,
        message: 'Invalid tour data provided'
      });
    } else if (error.code === 7) { // PERMISSION_DENIED
      res.status(403).json({
        success: false,
        message: 'You do not have permission to create tours'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

module.exports = router;