const Joi = require('joi');

// Schema for creating a key point
const createKeyPointSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Key point name is required',
      'string.min': 'Key point name must be at least 1 character',
      'string.max': 'Key point name cannot exceed 200 characters',
      'any.required': 'Key point name is required'
    }),
  
  description: Joi.string()
    .max(5000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  
  coordinates: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      })
  })
    .required()
    .messages({
      'any.required': 'Coordinates are required'
    }),
  
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.base': 'Images must be an array',
      'array.max': 'Maximum 10 images are allowed',
      'string.uri': 'Each image must be a valid URL'
    }),
  
  order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Order must be a number',
      'number.integer': 'Order must be an integer',
      'number.min': 'Order must be non-negative'
    }),
  
  isRequired: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isRequired must be a boolean'
    }),
  
  radius: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Radius must be a number',
      'number.integer': 'Radius must be an integer',
      'number.min': 'Radius must be at least 1 meter',
      'number.max': 'Radius cannot exceed 1000 meters'
    }),
  
  estimatedTimeMinutes: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .messages({
      'number.base': 'Estimated time must be a number',
      'number.integer': 'Estimated time must be an integer',
      'number.min': 'Estimated time must be at least 1 minute',
      'number.max': 'Estimated time cannot exceed 1440 minutes (24 hours)'
    })
});

// Schema for updating a key point
const updateKeyPointSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'Key point name cannot be empty',
      'string.min': 'Key point name must be at least 1 character',
      'string.max': 'Key point name cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .max(5000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 5000 characters'
    }),
  
  coordinates: Joi.object({
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required'
      }),
    
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required'
      })
  })
    .optional(),
  
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.base': 'Images must be an array',
      'array.max': 'Maximum 10 images are allowed',
      'string.uri': 'Each image must be a valid URL'
    }),
  
  order: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Order must be a number',
      'number.integer': 'Order must be an integer',
      'number.min': 'Order must be non-negative'
    }),
  
  isRequired: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isRequired must be a boolean'
    }),
  
  radius: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Radius must be a number',
      'number.integer': 'Radius must be an integer',
      'number.min': 'Radius must be at least 1 meter',
      'number.max': 'Radius cannot exceed 1000 meters'
    }),
  
  estimatedTimeMinutes: Joi.number()
    .integer()
    .min(1)
    .max(1440)
    .optional()
    .messages({
      'number.base': 'Estimated time must be a number',
      'number.integer': 'Estimated time must be an integer',
      'number.min': 'Estimated time must be at least 1 minute',
      'number.max': 'Estimated time cannot exceed 1440 minutes (24 hours)'
    })
});

// Schema for reordering key points
const reorderKeyPointsSchema = Joi.object({
  keyPointOrders: Joi.array()
    .items(Joi.object({
      keyPointId: Joi.number()
        .integer()
        .required()
        .messages({
          'number.base': 'Key point ID must be a number',
          'number.integer': 'Key point ID must be an integer',
          'any.required': 'Key point ID is required'
        }),
      
      order: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
          'number.base': 'Order must be a number',
          'number.integer': 'Order must be an integer',
          'number.min': 'Order must be non-negative',
          'any.required': 'Order is required'
        })
    }))
    .min(1)
    .required()
    .messages({
      'array.base': 'Key point orders must be an array',
      'array.min': 'At least one key point order is required',
      'any.required': 'Key point orders are required'
    })
});

// Schema for query parameters
const queryParamsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

// Middleware functions
const validateCreateKeyPoint = (req, res, next) => {
  const { error } = createKeyPointSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

const validateUpdateKeyPoint = (req, res, next) => {
  const { error } = updateKeyPointSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

const validateReorderKeyPoints = (req, res, next) => {
  const { error } = reorderKeyPointsSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

const validateQueryParams = (req, res, next) => {
  const { error } = queryParamsSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      message: 'Query validation error',
      errors: error.details.map(detail => ({
        path: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

module.exports = {
  validateCreateKeyPoint,
  validateUpdateKeyPoint,
  validateReorderKeyPoints,
  validateQueryParams
};