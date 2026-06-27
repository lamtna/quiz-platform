'use strict';

const mongoose = require('mongoose');
const GameService = require('../services/game.service');
const { getIo } = require('../sockets');

/**
 * 🧠 GET NEXT QUESTION
 */
exports.getNextQuestion = async (req, res, next) => {
  try {
    const { gameId, categoryId, difficulty } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(gameId) ||
      !mongoose.Types.ObjectId.isValid(categoryId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IDs',
      });
    }

    const { game, question } = await GameService.getNextQuestion({
      gameId,
      categoryId,
      difficulty,
    });

    const io = getIo();

    if (io && question) {
      io.to(game._id.toString()).emit('newQuestion', {
        question,
      });
    }

    return res.json({
      success: true,
      data: question,
      gameStatus: game.status,
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🎯 SUBMIT ANSWER
 */
exports.submitAnswer = async (req, res, next) => {
  try {
    const { gameId, questionId, answer, team } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(gameId) ||
      !mongoose.Types.ObjectId.isValid(questionId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IDs',
      });
    }

    const { game, isCorrect, question } =
      await GameService.submitAnswer({
        gameId,
        questionId,
        answer,
        team,
      });

    const io = getIo();

    if (io) {
      io.to(game._id.toString()).emit('answerResult', {
        questionId,
        team,
        isCorrect,
        score: game.score,
      });

      if (game.status === 'finished') {
        io.to(game._id.toString()).emit('gameFinished', {
          winner: game.winner,
          score: game.score,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.answer,
        score: game.score,
        isFinished: game.status === 'finished',
        winner: game.winner || null,
      },
    });

  } catch (err) {
    next(err);
  }
};