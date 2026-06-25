'use strict';

const Game = require('../models/Game');
const Question = require('../models/Question');
const mongoose = require('mongoose');

const { pickRandom } = require('../services/questionSelector.service');

// ✅ FIXED SOCKET IMPORT
const { getIo } = require('../sockets');

/**
 * ─────────────────────────────
 * 🧠 AUTO FINISH CHECK
 * ─────────────────────────────
 */
const autoCheckFinish = async (game) => {
  if (!game?.board?.length) return false;

  const allAnswered = game.board.every((c) => c.isAnswered);
  if (!allAnswered) return false;

  let winner = 'tie';

  const teamAScore = game.score?.teamA || 0;
  const teamBScore = game.score?.teamB || 0;

  if (teamAScore > teamBScore) winner = 'teamA';
  else if (teamBScore > teamAScore) winner = 'teamB';

  game.winner = winner;
  game.status = 'finished';
  game.finishedAt = new Date();

  await game.save();

  const io = getIo();
  io.to(game._id.toString()).emit('gameFinished', {
    winner,
    score: game.score,
  });

  return true;
};

/* ─────────────────────────────
   🎮 GET GAMES
───────────────────────────── */
exports.getGames = async (req, res, next) => {
  try {
    const games = await Game.find({
      organizationId: req.tenantId,
    });

    res.json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────
   🎯 GET GAME BY ID
───────────────────────────── */
exports.getGameById = async (req, res, next) => {
  try {
    const game = await Game.findOne({
      _id: req.params.id,
      organizationId: req.tenantId,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    res.json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────
   🎮 START GAME
───────────────────────────── */
exports.startGame = async (req, res, next) => {
  try {
    const game = await Game.findOne({
      _id: req.params.id,
      organizationId: req.tenantId,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    game.status = 'active';
    game.startedAt = new Date();

    await game.save();

    const io = getIo();
    io.to(game._id.toString()).emit('gameStarted', {
      gameId: game._id,
      status: game.status,
    });

    res.json({ success: true, message: 'Game started' });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────
   ❓ GET NEXT QUESTION
───────────────────────────── */
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

    const game = await Game.findOne({
      _id: gameId,
      organizationId: req.tenantId,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
      });
    }

    const usedIds = (game.board || [])
      .map((c) => c.questionId?.toString())
      .filter(Boolean);

    const question = await pickRandom(categoryId, difficulty, usedIds);

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
      categoryName: '',
      difficulty,
      questionId: question._id,
      isAnswered: false,
      answeredBy: null,
      pointsAwarded: 0,
      answeredAt: null,
    });

    await game.save();

    const io = getIo();
    io.to(game._id.toString()).emit('newQuestion', { question });

    res.json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────
   🎯 SUBMIT ANSWER
───────────────────────────── */
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

    const game = await Game.findOne({
      _id: gameId,
      organizationId: req.tenantId,
    });

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
      normalize(question.correctAnswer) === normalize(answer);

    game.score = game.score || { teamA: 0, teamB: 0 };

    if (!game.score[team]) {
      game.score[team] = 0;
    }

    if (cell) {
      cell.isAnswered = true;
      cell.answeredBy = team;
      cell.pointsAwarded = isCorrect ? (question.points || 100) : 0;
      cell.answeredAt = new Date();
    }

    if (isCorrect) {
      game.score[team] += question.points || 100;
    }

    game.currentQuestion = null;

    await game.save();

    const io = getIo();
    io.to(game._id.toString()).emit('answerResult', {
      questionId,
      team,
      isCorrect,
      score: game.score,
    });

    const isFinished = await autoCheckFinish(game);

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        score: game.score,
        isFinished,
        winner: game.winner || null,
      },
    });
  } catch (err) {
    next(err);
  }
};