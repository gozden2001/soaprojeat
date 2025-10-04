const Joi = require('joi');

const createBlogSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required().messages({
          'string.uri': 'Image URL must be valid',
          'string.empty': 'Image URL is required'
        }),
        description: Joi.string().max(500).allow('').messages({
          'string.max': 'Image description cannot exceed 500 characters'
        })
      })
    )
    .min(0)
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 images'
    }),
  
  tags: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        'string.max': 'Tag cannot exceed 50 characters'
      })
    )
    .max(20)
    .messages({
      'array.max': 'Cannot have more than 20 tags'
    }),
  
  isPublished: Joi.boolean().default(true),
  
  authorUsername: Joi.string().optional(), // Allow this field from the route
  authorRole: Joi.string().optional() // Allow this field from the route
});

const updateBlogSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required().messages({
          'string.uri': 'Image URL must be valid',
          'string.empty': 'Image URL is required'
        }),
        description: Joi.string().max(500).allow('').messages({
          'string.max': 'Image description cannot exceed 500 characters'
        })
      })
    )
    .min(0)
    .max(10)
    .messages({
      'array.max': 'Cannot have more than 10 images'
    }),
  
  tags: Joi.array()
    .items(
      Joi.string().trim().max(50).messages({
        'string.max': 'Tag cannot exceed 50 characters'
      })
    )
    .max(20)
    .messages({
      'array.max': 'Cannot have more than 20 tags'
    }),
  
  isPublished: Joi.boolean()
});

const validateCreateBlog = (req, res, next) => {
  const { error } = createBlogSchema.validate(req.body, { abortEarly: false });
  
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
  
  next();
};

const validateUpdateBlog = (req, res, next) => {
  const { error } = updateBlogSchema.validate(req.body, { abortEarly: false });
  
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
  
  next();
};

module.exports = {
  validateCreateBlog,
  validateUpdateBlog,
  blogValidators: {
    create: createBlogSchema,
    update: updateBlogSchema
  }
};