'use strict';

module.exports = (sequelize, DataTypes) => {
  const Tour = sequelize.define('Tour', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Tour name is required'
        },
        len: {
          args: [1, 200],
          msg: 'Tour name must be between 1 and 200 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Tour description is required'
        },
        len: {
          args: [10, 5000],
          msg: 'Tour description must be between 10 and 5000 characters'
        }
      }
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['easy', 'medium', 'hard']],
          msg: 'Difficulty must be easy, medium, or hard'
        }
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          if (value && value.some(tag => typeof tag !== 'string')) {
            throw new Error('All tags must be strings');
          }
          if (value && value.length > 10) {
            throw new Error('Maximum 10 tags allowed');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'published', 'archived']],
          msg: 'Status must be draft, published, or archived'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: [0],
          msg: 'Price cannot be negative'
        },
        isDecimal: {
          msg: 'Price must be a valid decimal number'
        }
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Author ID is required'
        },
        isInt: {
          msg: 'Author ID must be an integer'
        }
      }
    },
    authorUsername: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Author username is required'
        }
      }
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      validate: {
        isArrayOfStrings(value) {
          if (value && !Array.isArray(value)) {
            throw new Error('Images must be an array');
          }
          if (value && value.some(img => typeof img !== 'string')) {
            throw new Error('All image URLs must be strings');
          }
          if (value && value.length > 10) {
            throw new Error('Maximum 10 images allowed');
          }
        }
      }
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated duration in minutes',
      validate: {
        min: {
          args: [1],
          msg: 'Duration must be at least 1 minute'
        },
        max: {
          args: [43200], // 30 days in minutes
          msg: 'Duration cannot exceed 30 days'
        }
      }
    }
  }, {
    tableName: 'tours',
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        fields: ['authorId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['difficulty']
      },
      {
        fields: ['tags'],
        using: 'gin'
      },
      {
        fields: ['createdAt']
      }
    ],
    scopes: {
      published: {
        where: {
          status: 'published'
        }
      },
      draft: {
        where: {
          status: 'draft'
        }
      },
      archived: {
        where: {
          status: 'archived'
        }
      },
      byAuthor: (authorId) => ({
        where: {
          authorId: authorId
        }
      }),
      withImages: {
        where: {
          images: {
            [sequelize.Sequelize.Op.ne]: []
          }
        }
      }
    }
  });

  Tour.associate = function(models) {
    // Define associations here if needed
    // Example: Tour.hasMany(models.KeyPoint, { foreignKey: 'tourId', as: 'keyPoints' });
  };

  // Instance methods
  Tour.prototype.toJSON = function() {
    const values = { ...this.get() };
    
    // Convert tags array to ensure it's properly formatted
    if (values.tags && Array.isArray(values.tags)) {
      values.tags = values.tags.filter(tag => tag && tag.trim());
    }
    
    // Format price
    if (values.price) {
      values.price = parseFloat(values.price);
    }
    
    return values;
  };

  Tour.prototype.canBeEditedBy = function(userId) {
    return this.authorId === parseInt(userId);
  };

  Tour.prototype.publish = function() {
    if (this.status !== 'draft') {
      throw new Error('Only draft tours can be published');
    }
    this.status = 'published';
    return this.save();
  };

  Tour.prototype.archive = function() {
    if (this.status !== 'published') {
      throw new Error('Only published tours can be archived');
    }
    this.status = 'archived';
    return this.save();
  };

  // Class methods
  Tour.findPublished = function(options = {}) {
    return this.scope('published').findAll(options);
  };

  Tour.findByAuthor = function(authorId, options = {}) {
    return this.scope({ method: ['byAuthor', authorId] }).findAll(options);
  };

  Tour.searchByTags = function(tags, options = {}) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    return this.findAll({
      where: {
        tags: {
          [sequelize.Sequelize.Op.overlap]: tagArray
        }
      },
      ...options
    });
  };

  return Tour;
};