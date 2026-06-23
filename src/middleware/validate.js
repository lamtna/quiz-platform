const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/apiResponse');

/**
 * Runs after express-validator chains.
 * Collects errors and returns a 400 if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return badRequest(res, 'Validation failed', messages);
  }
  next();
};

module.exports = validate;
