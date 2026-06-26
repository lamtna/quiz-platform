const jwt = require('jsonwebtoken');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/generateToken');

const { unauthorized, success } = require('../utils/apiResponse');

const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      return unauthorized(res, 'Refresh token is required');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const userId = decoded?.id;
    if (!userId) {
      return unauthorized(res, 'Invalid token payload');
    }

    const accessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    return success(
      res,
      { accessToken, refreshToken: newRefreshToken },
      'Token refreshed successfully'
    );
  } catch (err) {
    return unauthorized(res, 'Invalid or expired refresh token');
  }
};

module.exports = { refreshToken };