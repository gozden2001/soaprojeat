const Joi = require('joi');

const followUserSchema = Joi.object({
  followingId: Joi.number()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID to follow is required'
    }),
  followingUsername: Joi.string()
    .required()
    .messages({
      'string.empty': 'Username to follow is required'
    })
});

const createCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 1000 characters'
    })
});

const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Comment content is required',
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 1000 characters'
    })
});

const validateFollowUser = (req, res, next) => {
  const { error } = followUserSchema.validate(req.body, { abortEarly: false });
  
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

const validateCreateComment = (req, res, next) => {
  const { error } = createCommentSchema.validate(req.body, { abortEarly: false });
  
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

const validateUpdateComment = (req, res, next) => {
  const { error } = updateCommentSchema.validate(req.body, { abortEarly: false });
  
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
  validateFollowUser,
  validateCreateComment,
  validateUpdateComment,
  followValidators: {
    follow: followUserSchema
  },
  commentValidators: {
    create: createCommentSchema,
    update: updateCommentSchema
  }
};