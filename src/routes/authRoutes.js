const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Register
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 }),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  validate,
  register
);

// Login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

// Profile
router.get(
  '/me',
  protect,
  getMe
);

module.exports = router;