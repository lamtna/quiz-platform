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
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { REQUIRED_CATEGORIES, DIFFICULTY_LEVELS } = require('../config/constants');

// All game routes require auth
router.use(protect);

router.get('/', getGames);
router.get('/:id', getGameById);
router.get('/:id/summary', getGameSummary);

router.post(
  '/',
  [
    body('gameName').trim().notEmpty().withMessage('Game name is required'),
    body('teamAName').trim().notEmpty().withMessage('Team A name is required'),
    body('teamBName').trim().notEmpty().withMessage('Team B name is required'),
    body('categoryIds')
      .isArray({ min: REQUIRED_CATEGORIES, max: REQUIRED_CATEGORIES })
      .withMessage(`Exactly ${REQUIRED_CATEGORIES} categories required`),
    body('categoryIds.*').isMongoId().withMessage('Each category must be a valid ID'),
  ],
  validate,
  createGame
);

router.post(
  '/:id/select-question',
  [
    body('categoryId').isMongoId().withMessage('Valid category ID is required'),
    body('difficulty')
      .isIn(DIFFICULTY_LEVELS)
      .withMessage(`Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`),
  ],
  validate,
  selectQuestion
);

router.post(
  '/:id/reveal-answer',
  [
    body('teamScored')
      .optional({ nullable: true })
      .isIn(['teamA', 'teamB', null])
      .withMessage('teamScored must be "teamA", "teamB", or null'),
  ],
  validate,
  revealAnswer
);

router.post('/:id/finish', finishGame);

router.delete('/:id', deleteGame);

module.exports = router;
