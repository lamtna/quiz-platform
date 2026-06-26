'use strict';

const Game = require('../models/Game');
const Question = require('../models/Question');
const mongoose = require('mongoose');
const questionSelector = require('../services/questionSelector.service');
const { getIo } = require('../sockets');

/**
 * 🧠 GET NEXT QUESTION (DB ONLY)
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

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    const usedIds = (game.board || [])
      .map((c) => c.questionId?.toString())
      .filter(Boolean);

    const question = await questionSelector.pickRandom(
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
      duration: question.timer ?? 30,
    };

    game.board.push({
      categoryId,
      categoryName: 'UNKNOWN',
      difficulty,
      questionId: question._id,
      isAnswered: false,
      answeredBy: null,
      pointsAwarded: 0,
      answeredAt: null,
    });

    await game.save();

    const io = getIo();
    if (io) {
      io.to(game._id.toString()).emit('newQuestion', {
        question,
      });
    }

    return res.json({
      success: true,
      data: question,
    });

  } catch (err) {
    next(err);
  }
};

/**
 * 🎯 SUBMIT ANSWER (DB ONLY)
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

    const cell = game.board.find(
      (c) => c.questionId?.toString() === questionId
    );

    if (cell?.isAnswered) {
      return res.status(400).json({
        success: false,
        message: 'Already answered',
      });
    }

    const normalize = (v) =>
      (v || '').toString().trim().toLowerCase();

    const isCorrect =
      normalize(question.answer) === normalize(answer);

    const points = question.difficulty || 100;

    game.score = game.score || { teamA: 0, teamB: 0 };

    if (isCorrect) {
      game.score[team] += points;
    }

    if (cell) {
      cell.isAnswered = true;
      cell.answeredBy = team;
      cell.pointsAwarded = isCorrect ? points : 0;
      cell.answeredAt = new Date();
    }

    game.currentQuestion = null;

    await game.save();

    const io = getIo();
    if (io) {
      io.to(game._id.toString()).emit('answerResult', {
        questionId,
        team,
        isCorrect,
        score: game.score,
      });
    }

    const allAnswered = game.board.every(c => c.isAnswered);

    if (allAnswered) {
      let winner = 'tie';

      if (game.score.teamA > game.score.teamB) winner = 'teamA';
      else if (game.score.teamB > game.score.teamA) winner = 'teamB';

      game.status = 'finished';
      game.winner = winner;
      game.finishedAt = new Date();

      await game.save();

      if (io) {
        io.to(game._id.toString()).emit('gameFinished', {
          winner,
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