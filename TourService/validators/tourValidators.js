const Joi = require('joi');

// Tour creation schema
const createTourSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Tour name is required',
      'string.min': 'Tour name cannot be empty',
      'string.max': 'Tour name cannot exceed 200 characters'
    }),
  description: Joi.string()
    .trim()
    .min(10)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Tour description is required',
      'string.min': 'Tour description must be at least 10 characters',
      'string.max': 'Tour description cannot exceed 5000 characters'
    }),
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .required()
    .messages({
      'any.only': 'Difficulty must be easy, medium, or hard'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .max(10)
    .optional()
    .default([])
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.min': 'Tag cannot be empty',
      'string.max': 'Tag cannot exceed 50 characters'
    }),
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .default([])
    .messages({
      'array.max': 'Maximum 10 images allowed',
      'string.uri': 'Invalid image URL format'
    }),
  estimatedDuration: Joi.number()
    .integer()
    .min(1)
    .max(43200) // 30 days in minutes
    .optional()
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 30 days'
    })
});

// Tour update schema (all fields optional)
const updateTourSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Tour name cannot be empty',
      'string.max': 'Tour name cannot exceed 200 characters'
    }),
  description: Joi.string()
    .trim()
    .min(10)
    .max(5000)
    .optional()
    .messages({
      'string.min': 'Tour description must be at least 10 characters',
      'string.max': 'Tour description cannot exceed 5000 characters'
    }),
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .optional()
    .messages({
      'any.only': 'Difficulty must be easy, medium, or hard'
    }),
  tags: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 tags allowed',
      'string.min': 'Tag cannot be empty',
      'string.max': 'Tag cannot exceed 50 characters'
    }),
  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .optional()
    .messages({
      'array.max': 'Maximum 10 images allowed',
      'string.uri': 'Invalid image URL format'
    }),
  estimatedDuration: Joi.number()
    .integer()
    .min(1)
    .max(43200)
    .optional()
    .messages({
      'number.min': 'Duration must be at least 1 minute',
      'number.max': 'Duration cannot exceed 30 days'
    }),
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .optional()
    .messages({
      'any.only': 'Status must be draft, published, or archived'
    }),
  price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.min': 'Price cannot be negative'
    })
});

// Query parameters schema for listing tours
const listToursSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  status: Joi.string()
    .valid('draft', 'published', 'archived')
    .optional(),
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .optional(),
  tags: Joi.string()
    .optional()
    .custom((value, helpers) => {
      // Convert comma-separated string to array
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      return value;
    }),
  authorId: Joi.number()
    .integer()
    .optional(),
  search: Joi.string()
    .trim()
    .max(100)
    .optional()
});

// Validation middleware
const validateCreateTour = (req, res, next) => {
  const { error, value } = createTourSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      path: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }
  
  req.body = value; // Use validated and transformed data
  next();
};

const validateUpdateTour = (req, res, next) => {
  const { error, value } = updateTourSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      path: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }
  
  req.body = value;
  next();
};

const validateListTours = (req, res, next) => {
  const { error, value } = listToursSchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      path: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }
  
  req.query = value;
  next();
};

module.exports = {
  validateCreateTour,
  validateUpdateTour,
  validateListTours,
  tourValidators: {
    create: createTourSchema,
    update: updateTourSchema,
    list: listToursSchema
  }
};