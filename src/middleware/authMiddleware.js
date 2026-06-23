const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return unauthorized(res, 'No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Get user from DB
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return unauthorized(res, 'User not found');
    }

    req.user = user;
    next();
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token');
  }
};

module.exports = { protect };