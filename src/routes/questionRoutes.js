const express = require('express');
const router = express.Router();

const {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getStats,
} = require('../controllers/question.controller');

const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { body } = require('express-validator');
const { DIFFICULTY_LEVELS } = require('../config/constants');

const { upload } = require('../config/cloudinary');

// ─────────────────────────────────────────────
// 🔐 All routes require login
// ─────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────
// 📊 Stats (admin only)
// ─────────────────────────────────────────────
router.get('/stats', adminOnly, getStats);

// ─────────────────────────────────────────────
// 📥 Get all questions (admin/editor/user optional view)
// ─────────────────────────────────────────────
router.get('/', getQuestions);

// ─────────────────────────────────────────────
// 📄 Get single question
// ─────────────────────────────────────────────
router.get('/:id', getQuestionById);

// ─────────────────────────────────────────────
// ➕ Create question (admin only)
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
    body('text').trim().notEmpty().withMessage('نص السؤال مطلوب'),
    body('answer').trim().notEmpty().withMessage('الإجابة مطلوبة'),
    body('difficulty')
      .isIn(DIFFICULTY_LEVELS)
      .withMessage(`الصعوبة يجب أن تكون: ${DIFFICULTY_LEVELS.join(', ')}`),
    body('categoryId').isMongoId().withMessage('معرف الفئة غير صالح'),
    body('timer').optional().isInt({ min: 5, max: 300 }),
  ],
  validate,
  createQuestion
);

// ─────────────────────────────────────────────
// ✏️ Update question (admin only)
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
// 🗑 Delete question (admin only)
// ─────────────────────────────────────────────
router.delete('/:id', adminOnly, deleteQuestion);

module.exports = router;