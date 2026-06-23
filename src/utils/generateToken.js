const jwt = require('jsonwebtoken');

/**
 * 🔐 Generate Access Token (short-lived)
 */
const generateAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
    }
  );
};

/**
 * 🔁 Generate Refresh Token (long-lived + version control)
 */
const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return jwt.sign(
    {
      id: user._id,
      ver: user.refreshTokenVersion,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};