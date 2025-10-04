const { Result, StatusEnum } = require('../utils/result');
const UserService = require('../services/userService');
const { User } = require('../models');
const sagaService = require('../services/sagaService');
const { parseValidationErrors } = require('../utils/errorParser');
const { registerValidator, loginValidator, profileValidator } = require('../validators/userValidators');
const { activeUsersGauge } = require('../utils/metrics');
const jwtParser = require('../utils/jwtParser');
const ms = require('ms');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully!
 *       400:
 *         description: Validation error or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/register',
	...registerValidator,
	parseValidationErrors,
	async (req, res) => {

		const user = req.body;
		// Validate role if provided
		if (user.role && !['vodic', 'turista'].includes(user.role)) {
			return res.status(400).json({ errors: [{ message: 'Invalid role. Must be vodic or turista' }] });
		}
		
		const result = await UserService.register(user, user.role || 'turista');

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(201).json({ message: 'User registered successfully!' });
	});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful!
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post('/login',
	...loginValidator,
	parseValidationErrors,
	async (req, res) => {
		const { email, password } = req.body;

		const result = await UserService.login(email, password);


		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		const user = result.data;
		const token = jwtParser.generateToken(user);
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: ms(process.env.COOKIE_EXPIRES_IN)
		});

		activeUsersGauge.inc();
		return res.status(result.code).json({
			message: 'Login successful!',
			username: user.username,
			role: user.role,
			token: token
		});
	});

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful!
 */
router.post('/logout',
	async (req, res) => {
		res.clearCookie('token');

		activeUsersGauge.dec();
		return res.status(200).json({ message: 'Logout successful!' });
	});

/**
 * @swagger
 * /api/user/operators:
 *   get:
 *     summary: Get list of operators
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of operators retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Manager role required
 */
/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 surname:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 biography:
 *                   type: string
 *                 motto:
 *                   type: string
 *                 profileImage:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', jwtParser.extractTokenUser, async (req, res) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

	const result = await UserService.getProfile(req.user.id);
	if (result.status === StatusEnum.FAIL) {
		return res.status(result.code).json({ errors: result.errors });
	}

	return res.status(result.code).json(result.data);
});

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               biography:
 *                 type: string
 *               motto:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully!
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', jwtParser.extractTokenUser, 
	...profileValidator,
	parseValidationErrors,
	async (req, res) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

	const result = await UserService.updateProfile(req.user.id, req.body);
	if (result.status === StatusEnum.FAIL) {
		return res.status(result.code).json({ errors: result.errors });
	}

	return res.status(result.code).json({ message: 'Profile updated successfully!' });
});

router.get('/operators',jwtParser.extractTokenUser, async (req, res) => {
		if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
		if (req.user.role !== 'manager') {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const result = await UserService.findOperators();
		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json(result.data);
	}
);

/**
 * @swagger
 * /api/user/activate/{token}:
 *   get:
 *     summary: Activate user account
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Activation token
 *     responses:
 *       200:
 *         description: Account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account activated successfully!
 *       400:
 *         description: Invalid activation token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid activation token
 */
router.get('/activate/:token',
	async (req, res) => {
		let result;

		const token = req.params.token;
		result = jwtParser.decodeToken(token);
		if (result.status === StatusEnum.FAIL) {
			return res.status(400).json({ message: 'Invalid activation token' });
		}

		const user = result.data;
		result = await UserService.activateUser(user.email);

		if (result.status === StatusEnum.FAIL) {
			return res.status(result.code).json({ errors: result.errors });
		}

		return res.status(result.code).json({ message: 'Account activated successfully!' });
	});

/**
 * @swagger
 * /api/user/{id}/username:
 *   put:
 *     tags: [Users]
 *     summary: Update username with SAGA pattern (distributed transaction)
 *     description: Updates username in AuthService and propagates changes to ComplaintsService
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "new.username"
 *     responses:
 *       200:
 *         description: Username successfully updated across all services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: {type: boolean}
 *                 message: {type: string}
 *                 userId: {type: integer}
 *                 oldUsername: {type: string}
 *                 newUsername: {type: string}
 *       400: {description: Bad request or username already taken}
 *       404: {description: User not found}
 *       500: {description: SAGA transaction failed}
 */
router.put('/:id/username', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    const result = await sagaService.updateUsername(userId, username);
    res.status(200).json(result);

  } catch (error) {
    console.error('SAGA username update failed:', error.message);
    res.status(500).json({ 
      error: 'SAGA transaction failed',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/user/list:
 *   get:
 *     tags: [Users]
 *     summary: Lista korisnika (za testiranje SAGA transakcije)
 *     responses:
 *       200:
 *         description: Lista svih korisnika sa ID i username
 */
router.get('/list', async (req, res) => {
  try {
    const { User } = require('../models');
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
      order: [['id', 'ASC']]
    });
    
    res.status(200).json({
      users: users,
      sagaTestInfo: {
        howToTest: "Use PUT /api/users/{id}/username with body: {'username': 'new.name'}",
        example: users[0] ? `PUT /api/users/${users[0].id}/username` : "PUT /api/users/1/username"
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user position
/**
 * @swagger
 * /api/user/position:
 *   get:
 *     summary: Get current user position
 *     tags: [Position]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current position retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 45.2671
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: 19.8335
 *       404:
 *         description: Position not set
 *       401:
 *         description: Unauthorized
 */
router.get('/position', jwtParser.extractTokenUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['currentLatitude', 'currentLongitude']
    });

    if (!user || (!user.currentLatitude || !user.currentLongitude)) {
      return res.status(404).json({ 
        message: 'Position not set',
        latitude: null,
        longitude: null
      });
    }

    res.status(200).json({
      latitude: parseFloat(user.currentLatitude),
      longitude: parseFloat(user.currentLongitude)
    });
  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set current user position
/**
 * @swagger
 * /api/user/position:
 *   put:
 *     summary: Set current user position
 *     tags: [Position]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 45.2671
 *               longitude:
 *                 type: number
 *                 format: float
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 19.8335
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       400:
 *         description: Invalid coordinates
 *       401:
 *         description: Unauthorized
 */
router.put('/position', jwtParser.extractTokenUser, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ 
        error: 'Latitude and longitude must be numbers' 
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ 
        error: 'Latitude must be between -90 and 90' 
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: 'Longitude must be between -180 and 180' 
      });
    }

    await User.update({
      currentLatitude: latitude,
      currentLongitude: longitude
    }, {
      where: { id: req.user.id }
    });

    res.status(200).json({
      message: 'Position updated successfully',
      latitude: latitude,
      longitude: longitude
    });
  } catch (error) {
    console.error('Set position error:', error);
    res.status(500).json({ error: error.message });
  }
});

	
module.exports = router;