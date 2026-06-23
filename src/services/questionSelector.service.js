'use strict';

const Question = require('../models/Question');

/**
 * Random questions (basic mode)
 */
const getRandomQuestions = async ({
  categoryId,
  difficulty,
  limit = 10
}) => {
  const match = {};

  if (categoryId) match.category = categoryId;
  if (difficulty) match.difficulty = difficulty;

  return await Question.aggregate([
    { $match: match },
    { $sample: { size: limit } }
  ]);
};

/**
 * Questions by difficulty tiers (game mode)
 */
const getQuestionsByLevels = async ({
  categoryId,
  limits = {
    easy: 2,
    medium: 3,
    hard: 3,
    expert: 2
  }
}) => {
  const fetchByDifficulty = async (difficulty, limit) => {
    return await Question.aggregate([
      {
        $match: {
          category: categoryId,
          difficulty
        }
      },
      { $sample: { size: limit } }
    ]);
  };

  const easy = await fetchByDifficulty('easy', limits.easy);
  const medium = await fetchByDifficulty('medium', limits.medium);
  const hard = await fetchByDifficulty('hard', limits.hard);
  const expert = await fetchByDifficulty('expert', limits.expert);

  return [...easy, ...medium, ...hard, ...expert];
};

/**
 * 🎯 Pick single random question (USED by GAME ENGINE)
 */
const pickRandom = async (categoryId, difficulty, usedIds = []) => {
  const match = {
    category: categoryId,
    ...(difficulty ? { difficulty } : {}),
    _id: { $nin: usedIds },
  };

  const result = await Question.aggregate([
    { $match: match },
    { $sample: { size: 1 } }
  ]);

  return result[0] || null;
};

/**
 * 🎯 Mark question as used in game
 */
const markUsed = async (game, questionId) => {
  game.usedQuestions = game.usedQuestions || [];
  game.usedQuestions.push(questionId);
  return game.save();
};

module.exports = {
  getRandomQuestions,
  getQuestionsByLevels,
  pickRandom,
  markUsed
};