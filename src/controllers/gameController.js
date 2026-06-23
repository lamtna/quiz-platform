'use strict';

const Game = require('../models/Game');
const mongoose = require('mongoose');
const Question = require('../models/Question');

const {
  pickRandom,
} = require('../services/questionSelector.service');

/**
 * 🎮 GET NEXT QUESTION
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
        message: 'Invalid gameId or categoryId',
      });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    const usedIds = (game.board || [])
      .filter((c) => c.questionId)
      .map((c) => c.questionId.toString());

    const question = await pickRandom(
      categoryId,
      difficulty,
      usedIds
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'No questions available',
      });
    }

    game.currentQuestion = {
      questionId: question._id,
      categoryId,
      difficulty,
      startedAt: new Date(),
      duration: question.timer || 30,
    };

    game.board.push({
      categoryId,
      categoryName: '',
      difficulty,
      questionId: question._id,
      isAnswered: false,
      answeredBy: null,
      pointsAwarded: 0,
      answeredAt: null,
    });

    await game.save();

    return res.json({
      success: true,
      data: question,
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

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const isCorrect =
      question.correctAnswer?.toString().trim().toLowerCase() ===
      answer?.toString().trim().toLowerCase();

    const cell = game.board.find(
      (c) => c.questionId?.toString() === questionId
    );

    if (cell) {
      cell.isAnswered = true;
      cell.answeredBy = team;
      cell.pointsAwarded = isCorrect ? (question.points || 100) : 0;
      cell.answeredAt = new Date();
    }

    if (isCorrect) {
      game.score[team] += question.points || 100;
    }

    await game.save();

    return res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        score: game.score,
      },
    });

  } catch (err) {
    next(err);
  }
};