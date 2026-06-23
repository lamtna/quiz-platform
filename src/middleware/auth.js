const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized, forbidden } = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');

/**
 * protect — verifies JWT and attaches req.user.
 * Supports Bearer token in Authorization header.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return unauthorized(res, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

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
 * Restricts route to admin role only.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return forbidden(res, 'Admin access required.');
  }
  next();
};

module.exports = { protect, adminOnly };
