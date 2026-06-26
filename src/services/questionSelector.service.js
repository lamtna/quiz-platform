'use strict';

const mongoose = require('mongoose');
const Question = require('../models/Question');

/**
 * Random questions
 */
const getRandomQuestions = async ({ categoryId, difficulty, limit = 10 }) => {
  const match = {};

  if (categoryId) {
    match.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (difficulty) {
    match.difficulty = difficulty;
  }

  return await Question.aggregate([
    { $match: match },
    { $sample: { size: limit } }
  ]);
};

/**
 * Pick single random question
 */
const pickRandom = async (categoryId, difficulty, usedIds = []) => {
  const match = {
    _id: { $nin: usedIds.map(id => new mongoose.Types.ObjectId(id)) }
  };

  if (categoryId) {
    match.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (difficulty) {
    match.difficulty = difficulty;
  }

  const result = await Question.aggregate([
    { $match: match },
    { $sample: { size: 1 } }
  ]);

  return result[0] || null;
};

module.exports = {
  getRandomQuestions,
  pickRandom
};