const { Tour } = require('../models');
const { Op } = require('sequelize');

class TourService {
  // Create a new tour
  async createTour(tourData, author) {
    try {
      const tour = await Tour.create({
        ...tourData,
        authorId: author.id,
        authorUsername: author.username,
        status: 'draft', // Always start as draft
        price: 0.00 // Always start with price 0
      });

      return {
        success: true,
        data: tour,
        message: 'Tour created successfully'
      };
    } catch (error) {
      console.error('Create tour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create tour'
      };
    }
  }

  // Get all tours with filtering and pagination
  async getAllTours(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        difficulty,
        tags,
        authorId,
        search
      } = options;

      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {};
      
      if (status) {
        whereClause.status = status;
      }
      
      if (difficulty) {
        whereClause.difficulty = difficulty;
      }
      
      if (tags && tags.length > 0) {
        whereClause.tags = {
          [Op.overlap]: tags
        };
      }
      
      if (authorId) {
        whereClause.authorId = authorId;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Tour.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['deletedAt'] }
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          tours: rows,
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
      console.error('Get all tours error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tours'
      };
    }
  }

  // Get tours by author
  async getToursByAuthor(authorId, options = {}) {
    try {
      return await this.getAllTours({
        ...options,
        authorId
      });
    } catch (error) {
      console.error('Get tours by author error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch author tours'
      };
    }
  }

  // Get tour by ID
  async getTourById(tourId) {
    try {
      const tour = await Tour.findByPk(tourId, {
        attributes: { exclude: ['deletedAt'] }
      });

      if (!tour) {
        return {
          success: false,
          error: 'Tour not found'
        };
      }

      return {
        success: true,
        data: tour
      };
    } catch (error) {
      console.error('Get tour by ID error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tour'
      };
    }
  }

  // Update tour
  async updateTour(tourId, updateData, userId) {
    try {
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
          error: 'Access denied. You can only edit your own tours.'
        };
      }

      // Update the tour
      await tour.update(updateData);

      return {
        success: true,
        data: tour,
        message: 'Tour updated successfully'
      };
    } catch (error) {
      console.error('Update tour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update tour'
      };
    }
  }

  // Delete tour (soft delete)
  async deleteTour(tourId, userId) {
    try {
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
          error: 'Access denied. You can only delete your own tours.'
        };
      }

      await tour.destroy(); // Soft delete due to paranoid: true

      return {
        success: true,
        message: 'Tour deleted successfully'
      };
    } catch (error) {
      console.error('Delete tour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete tour'
      };
    }
  }

  // Publish tour
  async publishTour(tourId, userId, price) {
    try {
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
          error: 'Access denied. You can only publish your own tours.'
        };
      }

      await tour.publish(price);

      return {
        success: true,
        data: tour,
        message: 'Tour published successfully'
      };
    } catch (error) {
      console.error('Publish tour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to publish tour'
      };
    }
  }

  // Archive tour
  async archiveTour(tourId, userId) {
    try {
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
          error: 'Access denied. You can only archive your own tours.'
        };
      }

      await tour.archive();

      return {
        success: true,
        data: tour,
        message: 'Tour archived successfully'
      };
    } catch (error) {
      console.error('Archive tour error:', error);
      return {
        success: false,
        error: error.message || 'Failed to archive tour'
      };
    }
  }

  // Get tour statistics
  async getTourStats() {
    try {
      const totalTours = await Tour.count();
      const publishedTours = await Tour.count({ where: { status: 'published' } });
      const draftTours = await Tour.count({ where: { status: 'draft' } });
      const archivedTours = await Tour.count({ where: { status: 'archived' } });

      const difficultyStats = await Tour.findAll({
        attributes: [
          'difficulty',
          [Tour.sequelize.fn('COUNT', Tour.sequelize.col('id')), 'count']
        ],
        group: ['difficulty']
      });

      return {
        success: true,
        data: {
          total: totalTours,
          published: publishedTours,
          draft: draftTours,
          archived: archivedTours,
          byDifficulty: difficultyStats.reduce((acc, item) => {
            acc[item.difficulty] = parseInt(item.dataValues.count);
            return acc;
          }, {})
        }
      };
    } catch (error) {
      console.error('Get tour stats error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch tour statistics'
      };
    }
  }

  // Search tours by tags
  async searchToursByTags(tags, options = {}) {
    try {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      
      return await this.getAllTours({
        ...options,
        tags: tagArray
      });
    } catch (error) {
      console.error('Search tours by tags error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search tours by tags'
      };
    }
  }
}

module.exports = new TourService();