'use strict';

const questionSelector = require('./questionSelector.service');
const Game = require('../models/Game');

class GameEngine {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * 🎮 Start Game
   */
  async startGame({ gameId, categoryId, difficulty }) {
    if (!gameId) throw new Error('gameId is required');

    // check DB session first
    let game = this.sessions.get(gameId);

    if (!game) {
      game = {
        gameId,
        categoryId,
        difficulty,
        usedQuestions: [],
        questionIndex: 0,
        score: { teamA: 0, teamB: 0 },
        status: 'active',
        startedAt: new Date(),
        currentQuestion: null,
      };

      this.sessions.set(gameId, game);
    }

    const question = await questionSelector.pickRandom(
      categoryId,
      difficulty,
      []
    );

    if (!question) {
      game.status = 'waiting_questions';
      this.sessions.set(gameId, game);
      return game;
    }

    game.currentQuestion = question;
    game.usedQuestions.push(question._id);

    // optional DB sync (safe)
    await Game.findByIdAndUpdate(gameId, {
      status: 'active',
      startedAt: new Date(),
    });

    this.sessions.set(gameId, game);

    return game;
  }

  /**
   * ⏭️ Next Question
   */
  async nextQuestion(gameId) {
    const game = this.sessions.get(gameId);

    if (!game) throw new Error('Game not found in session');

    const question = await questionSelector.pickRandom(
      game.categoryId,
      game.difficulty,
      game.usedQuestions
    );

    if (!question) {
      game.status = 'finished';

      this.sessions.set(gameId, game);

      await Game.findByIdAndUpdate(gameId, {
        status: 'finished',
        finishedAt: new Date(),
      });

      return game;
    }

    game.usedQuestions.push(question._id);
    game.currentQuestion = question;
    game.questionIndex += 1;

    this.sessions.set(gameId, game);

    return game;
  }

  /**
   * 🎯 Submit Answer
   */
  async submitAnswer({ gameId, answer, team }) {
    const game = this.sessions.get(gameId);

    if (!game) throw new Error('Game session not found');

    const question = game.currentQuestion;

    if (!question) throw new Error('No active question');

    const normalize = (v) =>
      (v || '').toString().trim().toLowerCase();

    const isCorrect =
      normalize(question.answer) === normalize(answer);

    game.score = game.score || { teamA: 0, teamB: 0 };

    const points = question.difficulty || 100;

    if (isCorrect) {
      game.score[team] += points;
    }

    game.currentQuestion = null;

    this.sessions.set(gameId, game);

    await Game.findByIdAndUpdate(gameId, {
      score: game.score,
    });

    return {
      isCorrect,
      correctAnswer: question.answer,
      score: game.score,
    };
  }

  /**
   * 🧠 Get Game State
   */
  getGame(gameId) {
    return this.sessions.get(gameId);
  }
}

module.exports = new GameEngine();