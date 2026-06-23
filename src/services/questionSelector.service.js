'use strict';

/**
 * questionSelector.service.js
 * Service responsible for selecting questions for game sessions
 */

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
 * easy / medium / hard / expert
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

module.exports = {
  getRandomQuestions,
  getQuestionsByLevels
};
