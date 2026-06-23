const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { created, success, badRequest, unauthorized } = require('../utils/apiResponse');

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return badRequest(res, 'An account with this email already exists');
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    return created(res, { token, user }, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return unauthorized(res, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return unauthorized(res, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    // Strip password before sending
    const userObj = user.toJSON();

    return success(res, { token, user: userObj }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return success(res, { user: req.user }, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
