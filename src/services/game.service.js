'use strict';

const Game = require('../models/Game');
const Question = require('../models/Question');
const questionSelector = require('./questionSelector.service');

const normalize = (v) =>
  (v || '').toString().trim().toLowerCase();

class GameService {

  /**
   * 🎯 Get next question
   */
  async getNextQuestion({ gameId, categoryId, difficulty }) {
    const game = await Game.findById(gameId);

    if (!game) {
      throw new Error('Game not found');
    }

    const usedIds = (game.board || [])
      .map(c => c.questionId?.toString())
      .filter(Boolean);

    const question = await questionSelector.pickRandom(
      categoryId,
      difficulty,
      usedIds
    );

    if (!question) {
      game.status = 'finished';
      await game.save();

      return { game, question: null };
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

    return { game, question };
  }

  /**
   * 🎯 Submit answer
   */
  async submitAnswer({ gameId, questionId, answer, team }) {
    const game = await Game.findById(gameId);

    if (!game) throw new Error('Game not found');

    const question = await Question.findById(questionId);

    if (!question) throw new Error('Question not found');

    const cell = game.board.find(
      c => c.questionId?.toString() === questionId
    );

    if (cell?.isAnswered) {
      throw new Error('Already answered');
    }

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

    const allAnswered = game.board.every(c => c.isAnswered);

    if (allAnswered) {
      game.status = 'finished';

      let winner = 'tie';
      if (game.score.teamA > game.score.teamB) winner = 'teamA';
      else if (game.score.teamB > game.score.teamA) winner = 'teamB';

      game.winner = winner;
      game.finishedAt = new Date();
    }

    await game.save();

    return {
      game,
      isCorrect,
      question,
    };
  }
}

module.exports = new GameService();