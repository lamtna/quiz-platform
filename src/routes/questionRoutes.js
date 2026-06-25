'use strict';

const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const questionController = require('../controllers/questionController');

const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { DIFFICULTY_LEVELS } = require('../config/constants');
const { upload } = require('../config/cloudinary');

// ─────────────────────────────
// 🔐 AUTH
// ─────────────────────────────
router.use(protect);

// ─────────────────────────────
// ❗️ HARD SAFETY CHECK (no silent undefined)
// ─────────────────────────────
const requireFn = (name) => {
  const fn = questionController[name];

  if (!fn) {
    throw new Error(`❌ Controller missing function: ${name}`);
  }

  return fn;
};

// ─────────────────────────────
// 📋 GET ALL QUESTIONS
// ─────────────────────────────
router.get('/', requireFn('getAllQuestions'));

// ─────────────────────────────
// 📄 GET QUESTION BY ID
// ─────────────────────────────
router.get('/:id', requireFn('getQuestionById'));

// ─────────────────────────────
// ➕ CREATE QUESTION
// ─────────────────────────────
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
    body('text').trim().notEmpty(),
    body('answer').trim().notEmpty(),
    body('difficulty').isIn(DIFFICULTY_LEVELS),
    body('categoryId').isMongoId(),
    body('timer').optional().isInt({ min: 5, max: 300 }),
  ],
  validate,
  requireFn('createQuestion')
);

// ─────────────────────────────
// ✏️ UPDATE QUESTION
// ─────────────────────────────
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
  requireFn('updateQuestion')
);

// ─────────────────────────────
// 🗑 DELETE QUESTION
// ─────────────────────────────
router.delete('/:id', adminOnly, requireFn('deleteQuestion'));

module.exports = router;