const express = require('express');
const router = express.Router();
const TourExecutionService = require('../services/tourExecutionService');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/tour-execution/start:
 *   post:
 *     summary: Start tour execution
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tourId
 *             properties:
 *               tourId:
 *                 type: integer
 *                 description: ID of the tour to start
 *               startLatitude:
 *                 type: number
 *                 description: Starting latitude
 *               startLongitude:
 *                 type: number
 *                 description: Starting longitude
 *     responses:
 *       200:
 *         description: Tour execution started successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/start', requireRole(['turista']), async (req, res) => {
  try {
    const { tourId, startLatitude, startLongitude } = req.body;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID je obavezan' });
    }

    const result = await TourExecutionService.startTourExecution(
      req.user.id,
      tourId,
      startLatitude,
      startLongitude
    );

    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Start tour execution error:', error);
    res.status(500).json({ error: 'Greška pri pokretanju ture' });
  }
});

/**
 * @swagger
 * /api/tour-execution/active/{tourId}:
 *   get:
 *     summary: Get active execution for tour
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tour ID
 *     responses:
 *       200:
 *         description: Active execution retrieved successfully
 *       404:
 *         description: No active execution found
 *       401:
 *         description: Unauthorized
 */
router.get('/active/:tourId', requireRole(['turista']), async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);

    if (isNaN(tourId)) {
      return res.status(400).json({ error: 'Nevaljan Tour ID' });
    }

    const result = await TourExecutionService.getActiveExecution(req.user.id, tourId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data
      });
    } else {
      res.status(404).json({ error: result.error });
    }

  } catch (error) {
    console.error('Get active execution error:', error);
    res.status(500).json({ error: 'Greška pri dobijanju aktivne sesije' });
  }
});

/**
 * @swagger
 * /api/tour-execution/{executionId}/position:
 *   patch:
 *     summary: Update current position
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Execution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Current latitude
 *               longitude:
 *                 type: number
 *                 description: Current longitude
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch('/:executionId/position', requireRole(['turista']), async (req, res) => {
  try {
    const executionId = parseInt(req.params.executionId);
    const { latitude, longitude } = req.body;

    if (isNaN(executionId)) {
      return res.status(400).json({ error: 'Nevaljan Execution ID' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Latitude i longitude moraju biti brojevi' });
    }

    const result = await TourExecutionService.updatePosition(executionId, latitude, longitude);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju pozicije' });
  }
});

/**
 * @swagger
 * /api/tour-execution/{executionId}/check-keypoints:
 *   post:
 *     summary: Check if near key points
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Execution ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 description: Current latitude
 *               longitude:
 *                 type: number
 *                 description: Current longitude
 *               proximityRadius:
 *                 type: number
 *                 description: Proximity radius in meters (default 50)
 *     responses:
 *       200:
 *         description: Key points checked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/:executionId/check-keypoints', requireRole(['turista']), async (req, res) => {
  try {
    const executionId = parseInt(req.params.executionId);
    const { latitude, longitude, proximityRadius = 50 } = req.body;

    if (isNaN(executionId)) {
      return res.status(400).json({ error: 'Nevaljan Execution ID' });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Latitude i longitude moraju biti brojevi' });
    }

    const result = await TourExecutionService.checkKeyPoints(
      executionId,
      latitude,
      longitude,
      proximityRadius
    );

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Check key points error:', error);
    res.status(500).json({ error: 'Greška pri proveri ključnih tačaka' });
  }
});

/**
 * @swagger
 * /api/tour-execution/{executionId}/finish:
 *   patch:
 *     summary: Finish tour execution
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Execution ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [completed, abandoned]
 *                 description: Finish status (default completed)
 *               notes:
 *                 type: string
 *                 description: Optional notes
 *     responses:
 *       200:
 *         description: Tour execution finished successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.patch('/:executionId/finish', requireRole(['turista']), async (req, res) => {
  try {
    const executionId = parseInt(req.params.executionId);
    const { status = 'completed', notes } = req.body;

    if (isNaN(executionId)) {
      return res.status(400).json({ error: 'Nevaljan Execution ID' });
    }

    const result = await TourExecutionService.finishTourExecution(executionId, status, notes);

    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Finish tour execution error:', error);
    res.status(500).json({ error: 'Greška pri završavanju ture' });
  }
});

/**
 * @swagger
 * /api/tour-execution/history:
 *   get:
 *     summary: Get user's execution history
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Execution history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', requireRole(['turista']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await TourExecutionService.getUserExecutionHistory(req.user.id, page, limit);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Get execution history error:', error);
    res.status(500).json({ error: 'Greška pri dobijanju istorije' });
  }
});

/**
 * @swagger
 * /api/tour-execution/{executionId}/stats:
 *   get:
 *     summary: Get execution statistics
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: executionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Execution ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get('/:executionId/stats', requireRole(['turista']), async (req, res) => {
  try {
    const executionId = parseInt(req.params.executionId);

    if (isNaN(executionId)) {
      return res.status(400).json({ error: 'Nevaljan Execution ID' });
    }

    const result = await TourExecutionService.getExecutionStats(executionId);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Get execution stats error:', error);
    res.status(500).json({ error: 'Greška pri dobijanju statistika' });
  }
});

/**
 * @swagger
 * /api/tour-execution/test/cleanup:
 *   post:
 *     summary: Cleanup abandoned executions (development only)
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/test/cleanup', requireRole(['turista', 'administrator']), async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const result = await TourExecutionService.cleanupAbandonedExecutions();

    if (result.success) {
      res.status(200).json({
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Cleanup abandoned executions error:', error);
    res.status(500).json({ error: 'Greška pri čišćenju sesija' });
  }
});

/**
 * @swagger
 * /api/tour-execution/check-completion/{tourId}:
 *   get:
 *     summary: Check if user has completed a specific tour
 *     tags: [Tour Execution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the tour to check
 *     responses:
 *       200:
 *         description: Completion status returned
 *       401:
 *         description: Unauthorized
 */
router.get('/check-completion/:tourId', async (req, res) => {
  try {
    const tourId = parseInt(req.params.tourId);
    const userId = req.user.id;

    if (!tourId) {
      return res.status(400).json({ error: 'Tour ID je obavezan' });
    }

    const result = await TourExecutionService.checkTourCompletion(userId, tourId);

    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }

  } catch (error) {
    console.error('Check tour completion error:', error);
    res.status(500).json({ error: 'Greška pri proveri završetka ture' });
  }
});

module.exports = router;