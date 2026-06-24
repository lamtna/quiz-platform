'use strict';

const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createGame,
  getGames,
  getGameById,
  selectQuestion,
  revealAnswer,
  finishGame,
  getGameSummary,
  deleteGame,
} = require('../controllers/gameController');

const { protect } = require('../middleware/auth');
const attachTenant = require('../middleware/tenant');
const validate = require('../middleware/validate');

const {
  REQUIRED_CATEGORIES,
  DIFFICULTY_LEVELS,
} = require('../config/constants');

// ─────────────────────────────
// 🔐 AUTH + SAAS TENANT PROTECTION
// ─────────────────────────────
router.use(protect);
router.use(attachTenant); // 🏢 مهم جداً SaaS

// ─────────────────────────────
// 🎮 GAME ROUTES
// ─────────────────────────────

// 📊 Get all games (filtered by tenant)
router.get('/', getGames);

// 🎯 Get single game
router.get('/:id', getGameById);

// 📈 Game summary
router.get('/:id/summary', getGameSummary);

// 🆕 Create game
router.post(
  '/',
  [
    body('gameName').trim().notEmpty().withMessage('Game name is required'),
    body('teamAName').trim().notEmpty().withMessage('Team A name is required'),
    body('teamBName').trim().notEmpty().withMessage('Team B name is required'),

    body('categoryIds')
      .isArray({
        min: REQUIRED_CATEGORIES,
        max: REQUIRED_CATEGORIES,
      })
      .withMessage(`Exactly ${REQUIRED_CATEGORIES} categories required`),

    body('categoryIds.*')
      .isMongoId()
      .withMessage('Each category must be a valid ID'),
  ],
  validate,
  createGame
);

// ❓ Select question
router.post(
  '/:id/select-question',
  [
    body('categoryId')
      .isMongoId()
      .withMessage('Valid category ID is required'),

    body('difficulty')
      .isIn(DIFFICULTY_LEVELS)
      .withMessage(
        `Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`
      ),
  ],
  validate,
  selectQuestion
);

// 🎯 Reveal answer
router.post(
  '/:id/reveal-answer',
  [
    body('teamScored')
      .optional({ nullable: true })
      .isIn(['teamA', 'teamB', null])
      .withMessage('teamScored must be teamA, teamB, or null'),
  ],
  validate,
  revealAnswer
);

// 🏁 Finish game
router.post('/:id/finish', finishGame);

// 🗑 Delete game
router.delete('/:id', deleteGame);

module.exports = router;