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
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return unauthorized(res, 'Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const userId = decoded.id;

    if (!userId) {
      return unauthorized(res, 'Invalid refresh token');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(userId);

    // (Optional) rotate refresh token for better security
    const newRefreshToken = generateRefreshToken(userId);

    return success(res, {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully');

  } catch (err) {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
};

module.exports = {
  refreshToken,
};