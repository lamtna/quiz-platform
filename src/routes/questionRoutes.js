const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getStats,
} = require('../controllers/questionController');

const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { DIFFICULTY_LEVELS } = require('../config/constants');
const { upload } = require('../config/cloudinary');

// ─────────────────────────────────────────────
// 🔐 Authentication
// ─────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────
// 📊 Stats
// ─────────────────────────────────────────────
router.get('/stats', adminOnly, getStats);

// ─────────────────────────────────────────────
// 📋 Get all questions
// ─────────────────────────────────────────────
router.get('/', getQuestions);

// ─────────────────────────────────────────────
// 📄 Get question by ID
// ─────────────────────────────────────────────
router.get('/:id', getQuestionById);

// ─────────────────────────────────────────────
// ➕ Create question
// ─────────────────────────────────────────────
router.post(
  '/',
  adminOnly,
  upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'questionAudio', maxCount: 1 },
    { name: 'questionVideo', maxCount: 1 },
    { name: 'answerImage', maxCount: 1 },
    { name: 'answerAudio', maxCount: 1 },
    { name: 'answerVideo', maxCount: 1 },
  ]),
  [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Question text is required'),

    body('answer')
      .trim()
      .notEmpty()
      .withMessage('Answer is required'),

    body('difficulty')
      .isIn(DIFFICULTY_LEVELS)
      .withMessage(
        `Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`
      ),

    body('categoryId')
      .isMongoId()
      .withMessage('Valid category ID is required'),

    body('timer')
      .optional()
      .isInt({ min: 5, max: 300 }),
  ],
  validate,
  createQuestion
);

// ─────────────────────────────────────────────
// ✏️ Update question
// ─────────────────────────────────────────────
router.put(
  '/:id',
  adminOnly,
  upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'questionAudio', maxCount: 1 },
    { name: 'questionVideo', maxCount: 1 },
    { name: 'answerImage', maxCount: 1 },
    { name: 'answerAudio', maxCount: 1 },
    { name: 'answerVideo', maxCount: 1 },
  ]),
  updateQuestion
);

// ─────────────────────────────────────────────
// 🗑 Delete question
// ─────────────────────────────────────────────
router.delete(
  '/:id',
  adminOnly,
  deleteQuestion
);

module.exports = router;