'use strict';

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getGames,
  getGameById,
  startGame,
  getNextQuestion,
  submitAnswer,
} = require('../controllers/gameController');

const { protect } = require('../middleware/auth');
const attachTenant = require('../middleware/tenant');
const validate = require('../middleware/validate');

const {
  DIFFICULTY_LEVELS,
} = require('../config/constants');

// ─────────────────────────────
// 🔐 AUTH + TENANT
// ─────────────────────────────
router.use(protect);
router.use(attachTenant);

// ─────────────────────────────
// 🎮 GAME ROUTES (UPDATED)
// ─────────────────────────────

// 📊 Get all games
router.get('/', getGames);

// 🎯 Get single game
router.get('/:id', getGameById);

// 🎮 Start game
router.post('/:id/start', startGame);

// ❓ Get next question (NEW ENGINE FLOW)
router.post(
  '/:id/next-question',
  [
    body('gameId').isMongoId().withMessage('Invalid gameId'),
    body('categoryId').isMongoId().withMessage('Invalid categoryId'),
    body('difficulty')
      .isIn(DIFFICULTY_LEVELS)
      .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`),
  ],
  validate,
  getNextQuestion
);

// 🎯 Submit answer
router.post(
  '/:id/submit-answer',
  [
    body('gameId').isMongoId().withMessage('Invalid gameId'),
    body('questionId').isMongoId().withMessage('Invalid questionId'),
    body('answer').notEmpty().withMessage('Answer is required'),
    body('team').isIn(['teamA', 'teamB']).withMessage('Invalid team'),
  ],
  validate,
  submitAnswer
);

module.exports = router;