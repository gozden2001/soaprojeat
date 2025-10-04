const { User} = require('../models');
const { Result, StatusEnum } = require('../utils/result');
const { parseSequelizeErrors } = require('../utils/errorParser');
const jwtParser = require('../utils/jwtParser');
const { hashPassword, checkPasswordHash } = require('../utils/passwordHasher');
const sequelize = require('../models/index').sequelize;
const { raw } = require('express');
const BloomFilter = require('../utils/bloomFilter');
const { Op } = require('sequelize');

class UserService {
	constructor() {
		this.usernameBloomFilter = new BloomFilter(1000, 0.01);
		this._initializeBloomFilter();
	}

	async _initializeBloomFilter() {
		try {
			const users = await User.findAll({ attributes: ['username'] });
			users.forEach(user => {
					this.usernameBloomFilter.add(user.username);
			});
		} catch (error) {
			console.error('Error initializing bloom filter:', error);
		}
	}


	async findOperators() {
		const operators = await User.findAll({ where: { role: 'operator' } });
		return new Result(StatusEnum.OK, 200, operators);
	}

	async findByUsername(username) {
		const user = await User.findOne({ where: { username } });
		if (!user) {
			return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
		}
		return new Result(StatusEnum.OK, 200, user);
	}

	async isUsernameAvailable(username) {
		if (!this.usernameBloomFilter.mightContain(username)) {
				return true;
		}

		const user = await User.findOne({ where: { username } });
		return !user;
	}

	async register(user, role) {
		const isAvailable = await this.isUsernameAvailable(user.username);
		if (!isAvailable) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Username already taken' }]);
		}

		user.role = role;
		user.password = hashPassword(user.password);

		const transaction = await sequelize.transaction();
		try {
			user = await User.create(user, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			await transaction.commit();
		}
		catch (exception) {
			await transaction.rollback();
			const errors = parseSequelizeErrors(exception);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
		return new Result(StatusEnum.OK, 201, user);
	}
	async login(email, password) {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		const passwordsMatch = checkPasswordHash(password, user.password);
		if (!passwordsMatch) {
			return new Result(StatusEnum.FAIL, 400, null, [{ message: 'Invalid email or password' }]);
		}

		return new Result(StatusEnum.OK, 200, user);
	}

	async getProfile(userId) {
		try {
			const user = await User.findByPk(userId, {
				attributes: { exclude: ['password'] }
			});

			if (!user) {
				return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
			}

			return new Result(StatusEnum.OK, 200, user);
		} catch (error) {
			const errors = parseSequelizeErrors(error);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}

	async updateProfile(userId, profileData) {
		const transaction = await sequelize.transaction();
		try {
			// Remove fields that shouldn't be updated via profile
			const { password, email, username, role, ...allowedFields } = profileData;
			
			const [updatedRowsCount] = await User.update(allowedFields, {
				where: { id: userId },
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (updatedRowsCount === 0) {
				await transaction.rollback();
				return new Result(StatusEnum.FAIL, 404, null, [{ message: 'User not found' }]);
			}

			await transaction.commit();
			return new Result(StatusEnum.OK, 200, null);
		} catch (error) {
			await transaction.rollback();
			const errors = parseSequelizeErrors(error);
			return new Result(StatusEnum.FAIL, 500, null, errors);
		}
	}
}

module.exports = new UserService();