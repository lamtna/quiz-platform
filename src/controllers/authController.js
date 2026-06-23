const User = require('../models/User');
const jwt = require('jsonwebtoken');

const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

const {
  created,
  success,
  badRequest,
  unauthorized,
} = require('../utils/apiResponse');

/**
 * =========================
 * REGISTER
 * =========================
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return badRequest(res, 'An account with this email already exists');
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return created(
      res,
      {
        accessToken,
        refreshToken,
        user,
      },
      'Account created successfully'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * LOGIN
 * =========================
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return unauthorized(res, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return unauthorized(res, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return success(
      res,
      {
        accessToken,
        refreshToken,
        user,
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * GET ME
 * =========================
 */
const getMe = async (req, res) => {
  return success(res, { user: req.user }, 'User profile retrieved');
};

/**
 * =========================
 * LOGOUT (invalidate all sessions)
 * =========================
 */
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return unauthorized(res, 'User not found');
    }

    await user.revokeTokens();

    return success(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * REFRESH TOKEN (SECURE)
 * =========================
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return unauthorized(res, 'Refresh token is required');
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return unauthorized(res, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return unauthorized(res, 'User not found');
    }

    // 🔥 Security check (version control)
    if (decoded.ver !== user.refreshTokenVersion) {
      return unauthorized(res, 'Refresh token revoked');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return success(
      res,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshToken,
};