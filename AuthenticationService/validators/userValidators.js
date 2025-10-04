const { body } = require('express-validator');

exports.registerValidator = [
	body('name').notEmpty().withMessage('Name must not be empty'),
	body('surname').notEmpty().withMessage('Surname must not be empty'),
	body('username').isLength({ min: 6 }).withMessage('Username must be at least 6 characters long'),
	body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
	body('email').isEmail().withMessage('Email must be valid'),
	body('role').optional().isIn(['vodic', 'turista']).withMessage('Role must be either vodic or turista'),
	body('address.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),
	body('address.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180'),
];

exports.profileValidator = [
	body('name').optional().notEmpty().withMessage('Name must not be empty'),
	body('surname').optional().notEmpty().withMessage('Surname must not be empty'),
	body('biography').optional().isLength({ max: 1000 }).withMessage('Biography must not exceed 1000 characters'),
	body('motto').optional().isLength({ max: 200 }).withMessage('Motto must not exceed 200 characters'),
	body('profileImage').optional().isURL().withMessage('Profile image must be a valid URL'),
];

exports.loginValidator = [
	body('email').notEmpty().withMessage('Email must not be empty'),
	body('password').notEmpty().withMessage('Password must not be empty'),
]