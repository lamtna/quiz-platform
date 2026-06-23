const jwt = require('jsonwebtoken');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

const { unauthorized, success } = require('../utils/apiResponse');

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return unauthorized(res, 'Refresh token is required');
    }

    // Verify refresh token safely
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return unauthorized(res, 'Invalid or expired refresh token');
    }

    const userId = decoded?.id;

    if (!userId) {
      return unauthorized(res, 'Invalid token payload');
    }

    // Generate new tokens
    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    return success(
      res,
      {
        accessToken,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    );
  } catch (err) {
    return unauthorized(res, 'Something went wrong');
  }
};

module.exports = {
  refreshToken,
};