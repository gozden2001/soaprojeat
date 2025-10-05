const express = require('express');
const router = express.Router();
const GrpcClients = require('../grpc/grpcClients');
const { authenticateToken } = require('../middleware/auth');

// Delete keypoint via gRPC
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('[Gateway] gRPC keypoint deletion request for keypoint:', req.params.id, 'by user:', req.user.userId);
    
    const keyPointId = parseInt(req.params.id);
    const userId = req.user.userId;

    const response = await GrpcClients.deleteKeyPoint(keyPointId, userId);

    if (response.success) {
      res.status(200).json({
        success: true,
        message: 'Key point deleted successfully via gRPC'
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.message
      });
    }
  } catch (error) {
    console.error('gRPC keypoint deletion error:', error);
    
    if (error.code === 5) { // NOT_FOUND
      res.status(404).json({
        success: false,
        message: 'Key point not found'
      });
    } else if (error.code === 7) { // PERMISSION_DENIED
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this key point'
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