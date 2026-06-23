const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../config/constants');

/**
 * Extract and sanitize pagination params from request query.
 * @param {object} query - Express req.query
 * @returns {{ page, limit, skip }}
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

module.exports = { getPagination };
