const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized, forbidden } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * protect — verifies JWT and attaches req.user.
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return unauthorized(res, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return unauthorized(res, 'Invalid token payload.');
    }

    const user = await User.findById(userId);

    if (!user) {
      return unauthorized(res, 'Token is no longer valid. User not found.');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired. Please login again.');
    }

    return unauthorized(res, 'Invalid token.');
  }
};

/**
 * adminOnly — must be used AFTER protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return forbidden(res, 'Admin access required.');
  }
  next();
};

module.exports = { protect, adminOnly };