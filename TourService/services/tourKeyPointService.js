const { TourKeyPoint, Tour } = require('../models');
const { Op } = require('sequelize');

class TourKeyPointService {
  // Create a new key point for a tour
  async createKeyPoint(tourId, keyPointData, userId) {
    try {
      // First, verify the tour exists and user owns it
      const tour = await Tour.findByPk(tourId);
      
      if (!tour) {
        return {
          success: false,
          error: 'Tour not found'
        };
      }
      
      if (!tour.canBeEditedBy(userId)) {
        return {
          success: false,
          error: 'Access denied. You can only add key points to your own tours.'
        };
      }
      
      // Get the next order number for this tour
      const maxOrder = await TourKeyPoint.max('order', {
        where: { tourId }
      });
      
      const nextOrder = (maxOrder || 0) + 1;
      
      // Create the key point
      const keyPoint = await TourKeyPoint.create({
        tourId,
        name: keyPointData.name,
        description: keyPointData.description,
        coordinates: keyPointData.coordinates,
        images: keyPointData.images || [],
        order: keyPointData.order || nextOrder,
        isRequired: keyPointData.isRequired !== undefined ? keyPointData.isRequired : true,
        radius: keyPointData.radius || 50,
        estimatedTimeMinutes: keyPointData.estimatedTimeMinutes
      });
      
      return {
        success: true,
        data: keyPoint,
        message: 'Key point created successfully'
      };
    } catch (error) {
      console.error('Create key point error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create key point'
      };
    }
  }
  
  // Get all key points for a tour
  async getKeyPointsByTour(tourId, options = {}) {
    try {
      const { page = 1, limit = 50 } = options;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await TourKeyPoint.findAndCountAll({
        where: { 
          tourId,
          deletedAt: null
        },
        limit: parseInt(limit),
        offset: offset,
        order: [['order', 'ASC'], ['createdAt', 'ASC']],
        include: [{
          model: Tour,
          as: 'tour',
          attributes: ['id', 'name', 'authorId']
        }]
      });
      
      const totalPages = Math.ceil(count / limit);
      
      return {
        success: true,
        data: {
          keyPoints: rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      };
    } catch (error) {
      console.error('Get key points error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch key points'
      };
    }
  }
  
  // Get a specific key point by ID
  async getKeyPointById(keyPointId) {
    try {
      const keyPoint = await TourKeyPoint.findByPk(keyPointId, {
        include: [{
          model: Tour,
          as: 'tour',
          attributes: ['id', 'name', 'authorId', 'authorUsername']
        }]
      });
      
      if (!keyPoint) {
        return {
          success: false,
          error: 'Key point not found'
        };
      }
      
      return {
        success: true,
        data: keyPoint
      };
    } catch (error) {
      console.error('Get key point error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch key point'
      };
    }
  }
  
  // Update a key point
  async updateKeyPoint(keyPointId, updateData, userId) {
    try {
      const keyPoint = await TourKeyPoint.findByPk(keyPointId, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });
      
      if (!keyPoint) {
        return {
          success: false,
          error: 'Key point not found'
        };
      }
      
      if (!keyPoint.tour.canBeEditedBy(userId)) {
        return {
          success: false,
          error: 'Access denied. You can only edit key points of your own tours.'
        };
      }
      
      // Update the key point
      await keyPoint.update(updateData);
      
      return {
        success: true,
        data: keyPoint,
        message: 'Key point updated successfully'
      };
    } catch (error) {
      console.error('Update key point error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update key point'
      };
    }
  }
  
  // Delete a key point
  async deleteKeyPoint(keyPointId, userId) {
    try {
      const keyPoint = await TourKeyPoint.findByPk(keyPointId, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });
      
      if (!keyPoint) {
        return {
          success: false,
          error: 'Key point not found'
        };
      }
      
      if (!keyPoint.tour.canBeEditedBy(userId)) {
        return {
          success: false,
          error: 'Access denied. You can only delete key points of your own tours.'
        };
      }
      
      // Soft delete
      await keyPoint.destroy();
      
      return {
        success: true,
        message: 'Key point deleted successfully'
      };
    } catch (error) {
      console.error('Delete key point error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete key point'
      };
    }
  }
  
  // Reorder key points for a tour
  async reorderKeyPoints(tourId, keyPointOrders, userId) {
    try {
      // Verify the tour exists and user owns it
      const tour = await Tour.findByPk(tourId);
      
      if (!tour) {
        return {
          success: false,
          error: 'Tour not found'
        };
      }
      
      if (!tour.canBeEditedBy(userId)) {
        return {
          success: false,
          error: 'Access denied. You can only reorder key points of your own tours.'
        };
      }
      
      // Update orders in a transaction
      const updatedKeyPoints = [];
      
      for (const { keyPointId, order } of keyPointOrders) {
        const keyPoint = await TourKeyPoint.findOne({
          where: { 
            id: keyPointId, 
            tourId 
          }
        });
        
        if (keyPoint) {
          await keyPoint.update({ order });
          updatedKeyPoints.push(keyPoint);
        }
      }
      
      return {
        success: true,
        data: updatedKeyPoints,
        message: 'Key points reordered successfully'
      };
    } catch (error) {
      console.error('Reorder key points error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reorder key points'
      };
    }
  }
  
  // Get key points statistics for a tour
  async getKeyPointStats(tourId) {
    try {
      const stats = await TourKeyPoint.findOne({
        where: { tourId },
        attributes: [
          [TourKeyPoint.sequelize.fn('COUNT', TourKeyPoint.sequelize.col('id')), 'totalKeyPoints'],
          [TourKeyPoint.sequelize.fn('COUNT', TourKeyPoint.sequelize.literal('CASE WHEN "isRequired" = true THEN 1 END')), 'requiredKeyPoints'],
          [TourKeyPoint.sequelize.fn('SUM', TourKeyPoint.sequelize.col('estimatedTimeMinutes')), 'totalEstimatedTime']
        ],
        raw: true
      });
      
      return {
        success: true,
        data: {
          totalKeyPoints: parseInt(stats.totalKeyPoints) || 0,
          requiredKeyPoints: parseInt(stats.requiredKeyPoints) || 0,
          optionalKeyPoints: (parseInt(stats.totalKeyPoints) || 0) - (parseInt(stats.requiredKeyPoints) || 0),
          totalEstimatedTime: parseInt(stats.totalEstimatedTime) || 0
        }
      };
    } catch (error) {
      console.error('Get key point stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch key point statistics'
      };
    }
  }
}

module.exports = new TourKeyPointService();