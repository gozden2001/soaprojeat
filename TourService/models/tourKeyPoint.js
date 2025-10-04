'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TourKeyPoint extends Model {
    static associate(models) {
      // Each key point belongs to a tour
      TourKeyPoint.belongsTo(models.Tour, {
        foreignKey: 'tourId',
        as: 'tour',
        onDelete: 'CASCADE'
      });
    }

    // Instance method to check if key point can be edited by user
    canBeEditedBy(userId) {
      // User can edit if they own the tour this key point belongs to
      return this.tour && this.tour.authorId === userId;
    }

    // Instance method to get formatted data
    toJSON() {
      const values = { ...this.dataValues };
      
      // Parse coordinates if they're stored as string
      if (typeof values.coordinates === 'string') {
        try {
          values.coordinates = JSON.parse(values.coordinates);
        } catch (error) {
          values.coordinates = { latitude: 0, longitude: 0 };
        }
      }
      
      // Extract latitude and longitude for easier frontend access
      if (values.coordinates && typeof values.coordinates === 'object') {
        values.latitude = values.coordinates.latitude;
        values.longitude = values.coordinates.longitude;
      }
      
      // Parse images if they're stored as string
      if (typeof values.images === 'string') {
        try {
          values.images = JSON.parse(values.images);
        } catch (error) {
          values.images = [];
        }
      }
      
      return values;
    }
  }

  TourKeyPoint.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tours',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Key point name cannot be empty'
        },
        len: {
          args: [1, 200],
          msg: 'Key point name must be between 1 and 200 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 5000],
          msg: 'Description cannot exceed 5000 characters'
        }
      }
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isValidCoordinates(value) {
          if (!value || typeof value !== 'object') {
            throw new Error('Coordinates must be an object');
          }
          
          const { latitude, longitude } = value;
          
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            throw new Error('Latitude and longitude must be numbers');
          }
          
          if (latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
          }
          
          if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
          }
        }
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidImages(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
          
          if (value && value.length > 10) {
            throw new Error('Maximum 10 images are allowed');
          }
          
          if (value) {
            for (const image of value) {
              if (typeof image !== 'string') {
                throw new Error('Each image must be a string URL');
              }
            }
          }
        }
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Order must be a non-negative number'
        }
      }
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: {
          args: [1],
          msg: 'Radius must be at least 1 meter'
        },
        max: {
          args: [1000],
          msg: 'Radius cannot exceed 1000 meters'
        }
      }
    },
    estimatedTimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1],
          msg: 'Estimated time must be at least 1 minute'
        },
        max: {
          args: [1440],
          msg: 'Estimated time cannot exceed 1440 minutes (24 hours)'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'TourKeyPoint',
    tableName: 'TourKeyPoints',
    timestamps: true,
    paranoid: true, // Soft deletes
    underscored: false, // Use camelCase column names
    indexes: [
      {
        fields: ['tourId']
      },
      {
        fields: ['tourId', 'order']
      }
    ]
  });

  return TourKeyPoint;
};