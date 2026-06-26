'use strict';

const express = require('express');
const router = express.Router();

const gameEngine = require('../services/gameEngine.service');

const { protect } = require('../middleware/auth');

/**
 * 🔐 Auth only
 * ❌ remove attachTenant (سبب مشاكل + غير مكتمل)
 */
router.use(protect);

/**
 * 🎮 Start Game
 */
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;

    const game = await gameEngine.startGame({
      gameId: id,
      categoryId: req.body.categoryId,
      difficulty: req.body.difficulty
    });

    return res.json({
      success: true,
      data: game
    });

  } catch (err) {
    console.error('START GAME ERROR:', err.message);

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * ⏭️ Next Question
 */
router.post('/:id/next', async (req, res) => {
  try {
    const game = await gameEngine.nextQuestion(req.params.id);

    return res.json({
      success: true,
      data: game
    });

  } catch (err) {
    console.error('NEXT QUESTION ERROR:', err.message);

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * 🎯 Submit Answer (NEW - مهم جداً)
 */
router.post('/:id/answer', async (req, res) => {
  try {
    const { answer, team } = req.body;

    const result = await gameEngine.submitAnswer({
      gameId: req.params.id,
      answer,
      team
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error('ANSWER ERROR:', err.message);

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

/**
 * 📊 Get Game State
 */
router.get('/:id', (req, res) => {
  try {
    const game = gameEngine.getGame(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    return res.json({
      success: true,
      data: game
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;