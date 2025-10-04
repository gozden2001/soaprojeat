const { TourExecution, Tour, TourPurchaseToken, TourKeyPoint } = require('../models');
const { Op } = require('sequelize');

class TourExecutionService {
  
  // Start tour execution
  static async startTourExecution(userId, tourId, startLatitude = null, startLongitude = null) {
    try {
      // Check if tour exists
      const tour = await Tour.findByPk(tourId);
      if (!tour) {
        return {
          success: false,
          error: 'Tura ne postoji'
        };
      }

      // Check if tour is published or archived (both can be executed)
      if (tour.status === 'draft') {
        return {
          success: false,
          error: 'Draft ture ne mogu biti pokrenute'
        };
      }

      // Check if user has an active execution for this tour
      const activeExecution = await TourExecution.findOne({
        where: {
          userId,
          tourId,
          status: 'active'
        }
      });

      if (activeExecution) {
        return {
          success: false,
          error: 'Već imate aktivnu sesiju za ovu turu',
          data: activeExecution
        };
      }

      // For published tours, check if user has purchase token
      let purchaseTokenId = null;
      if (tour.status === 'published') {
        const purchaseToken = await TourPurchaseToken.findOne({
          where: {
            userId,
            tourId,
            status: 'completed',
            isActive: true
          }
        });

        if (!purchaseToken) {
          return {
            success: false,
            error: 'Morate kupiti turu da biste je pokrenuli'
          };
        }

        // Check if token is not expired
        if (purchaseToken.expiryDate && new Date() > new Date(purchaseToken.expiryDate)) {
          return {
            success: false,
            error: 'Vaš token za turu je istekao'
          };
        }

        purchaseTokenId = purchaseToken.id;
      }

      // Create tour execution
      const execution = await TourExecution.create({
        userId,
        tourId,
        purchaseTokenId,
        status: 'active',
        startTime: new Date(),
        lastActivity: new Date(),
        startLatitude,
        startLongitude,
        currentLatitude: startLatitude,
        currentLongitude: startLongitude,
        completedKeyPoints: [],
        totalDistance: 0
      });

      // Load execution with tour data
      const executionWithTour = await TourExecution.findByPk(execution.id, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      return {
        success: true,
        data: executionWithTour,
        message: 'Tura je uspešno pokrenuta'
      };

    } catch (error) {
      console.error('Start tour execution error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri pokretanju ture'
      };
    }
  }

  // Get active execution for user and tour
  static async getActiveExecution(userId, tourId) {
    try {
      const execution = await TourExecution.findOne({
        where: {
          userId,
          tourId,
          status: 'active'
        },
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      if (!execution) {
        return {
          success: false,
          error: 'Nema aktivne sesije za ovu turu'
        };
      }

      return {
        success: true,
        data: execution
      };

    } catch (error) {
      console.error('Get active execution error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri dobijanju aktivne sesije'
      };
    }
  }

  // Update position
  static async updatePosition(executionId, latitude, longitude) {
    try {
      const execution = await TourExecution.findByPk(executionId);
      
      if (!execution) {
        return {
          success: false,
          error: 'Sesija ne postoji'
        };
      }

      if (execution.status !== 'active') {
        return {
          success: false,
          error: 'Sesija nije aktivna'
        };
      }

      // Calculate distance if we have previous position
      let additionalDistance = 0;
      if (execution.currentLatitude && execution.currentLongitude) {
        additionalDistance = this.calculateDistance(
          execution.currentLatitude,
          execution.currentLongitude,
          latitude,
          longitude
        );
      }

      // Update position and distance
      await execution.updatePosition(latitude, longitude);
      execution.totalDistance = parseFloat(execution.totalDistance || 0) + additionalDistance;
      await execution.save();

      return {
        success: true,
        data: execution,
        message: 'Pozicija je ažurirana'
      };

    } catch (error) {
      console.error('Update position error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri ažuriranju pozicije'
      };
    }
  }

  // Check if user is near any key points
  static async checkKeyPoints(executionId, currentLatitude, currentLongitude, proximityRadius = 50) {
    try {
      const execution = await TourExecution.findByPk(executionId, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      if (!execution || execution.status !== 'active') {
        return {
          success: false,
          error: 'Aktivna sesija ne postoji'
        };
      }

      // Get all key points for the tour
      const keyPoints = await TourKeyPoint.findAll({
        where: { tourId: execution.tourId },
        order: [['order', 'ASC']]
      });

      const completedKeyPoints = execution.completedKeyPoints || [];
      const nearbyKeyPoints = [];
      const newCompletions = [];

      for (const keyPoint of keyPoints) {
        // Check if already completed
        const isCompleted = completedKeyPoints.some(cp => cp.keyPointId === keyPoint.id);
        
        // Calculate distance to key point
        const distance = this.calculateDistance(
          currentLatitude,
          currentLongitude,
          keyPoint.latitude,
          keyPoint.longitude
        );

        // If nearby (regardless of completion status for frontend display)
        if (distance <= proximityRadius) {
          nearbyKeyPoints.push({
            id: keyPoint.id,
            name: keyPoint.name,
            description: keyPoint.description,
            latitude: keyPoint.latitude,
            longitude: keyPoint.longitude,
            distance,
            completed: isCompleted
          });

          // If not already completed, mark as completed
          if (!isCompleted) {
            await execution.addCompletedKeyPoint(keyPoint.id);
            newCompletions.push({
              keyPointId: keyPoint.id,
              keyPointName: keyPoint.name,
              completedAt: new Date().toISOString(),
              distance
            });
          }
        }
      }

      // Reload execution to get updated completedKeyPoints
      await execution.reload();

      return {
        success: true,
        data: {
          nearbyKeyPoints,
          newCompletions,
          totalCompleted: (execution.completedKeyPoints || []).length,
          totalKeyPoints: keyPoints.length,
          allKeyPoints: keyPoints.map(kp => ({
            id: kp.id,
            name: kp.name,
            description: kp.description,
            latitude: kp.latitude,
            longitude: kp.longitude,
            completed: (execution.completedKeyPoints || []).some(cp => cp.keyPointId === kp.id),
            distance: this.calculateDistance(currentLatitude, currentLongitude, kp.latitude, kp.longitude)
          }))
        }
      };

    } catch (error) {
      console.error('Check key points error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri proveri ključnih tačaka'
      };
    }
  }

  // Finish tour execution
  static async finishTourExecution(executionId, status = 'completed', notes = null) {
    try {
      const execution = await TourExecution.findByPk(executionId);
      
      if (!execution) {
        return {
          success: false,
          error: 'Sesija ne postoji'
        };
      }

      if (execution.status !== 'active') {
        return {
          success: false,
          error: 'Sesija nije aktivna'
        };
      }

      // Validate status
      if (!['completed', 'abandoned'].includes(status)) {
        return {
          success: false,
          error: 'Nevaljan status'
        };
      }

      await execution.finish(status, notes);

      // Load with tour data
      const finishedExecution = await TourExecution.findByPk(execution.id, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      return {
        success: true,
        data: finishedExecution,
        message: status === 'completed' ? 'Tura je uspešno završena' : 'Tura je napuštena'
      };

    } catch (error) {
      console.error('Finish tour execution error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri završavanju ture'
      };
    }
  }

  // Get execution history for user
  static async getUserExecutionHistory(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { rows: executions, count: totalItems } = await TourExecution.findAndCountAll({
        where: { userId },
        include: [{
          model: Tour,
          as: 'tour'
        }],
        order: [['startTime', 'DESC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          executions,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        }
      };

    } catch (error) {
      console.error('Get user execution history error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri dobijanju istorije izvršavanja'
      };
    }
  }

  // Get execution statistics
  static async getExecutionStats(executionId) {
    try {
      const execution = await TourExecution.findByPk(executionId, {
        include: [{
          model: Tour,
          as: 'tour'
        }]
      });

      if (!execution) {
        return {
          success: false,
          error: 'Sesija ne postoji'
        };
      }

      // Get total key points for the tour
      const totalKeyPoints = await TourKeyPoint.count({
        where: { tourId: execution.tourId }
      });

      const completedKeyPoints = execution.getCompletedKeyPointsCount();
      const duration = execution.getDuration();
      const progress = totalKeyPoints > 0 ? (completedKeyPoints / totalKeyPoints) * 100 : 0;

      return {
        success: true,
        data: {
          executionId: execution.id,
          tourName: execution.tour.name,
          status: execution.status,
          startTime: execution.startTime,
          endTime: execution.endTime,
          duration, // in seconds
          totalDistance: execution.totalDistance,
          completedKeyPoints,
          totalKeyPoints,
          progress,
          lastActivity: execution.lastActivity,
          currentPosition: execution.currentLatitude && execution.currentLongitude ? {
            latitude: execution.currentLatitude,
            longitude: execution.currentLongitude
          } : null
        }
      };

    } catch (error) {
      console.error('Get execution stats error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri dobijanju statistika'
      };
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Cleanup abandoned executions (older than 24 hours)
  static async cleanupAbandonedExecutions() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const abandonedCount = await TourExecution.update(
        { 
          status: 'abandoned',
          endTime: new Date(),
          notes: 'Automatski napušteno zbog neaktivnosti'
        },
        {
          where: {
            status: 'active',
            lastActivity: {
              [Op.lt]: twentyFourHoursAgo
            }
          }
        }
      );

      return {
        success: true,
        data: { abandonedCount },
        message: `${abandonedCount} sesija je automatski napušteno`
      };

    } catch (error) {
      console.error('Cleanup abandoned executions error:', error);
      return {
        success: false,
        error: error.message || 'Greška pri čišćenju napuštenih sesija'
      };
    }
  }
}

module.exports = TourExecutionService;