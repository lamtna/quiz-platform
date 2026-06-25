'use strict';

const Question = require('../models/Question');
const Category = require('../models/Category');

const {
  success,
  created,
  notFound,
  badRequest,
} = require('../utils/apiResponse');

// ─────────────────────────────
// 📋 GET ALL QUESTIONS
// ─────────────────────────────
const getAllQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────
// 📄 GET ONE QUESTION
// ─────────────────────────────
const getQuestionById = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);

    if (!q) return notFound(res, 'Not found');

    return success(res, { question: q });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────
// ➕ CREATE QUESTION
// ─────────────────────────────
const createQuestion = async (req, res, next) => {
  try {
    const { text, answer, categoryId, difficulty } = req.body;

    if (!text || !answer || !categoryId) {
      return badRequest(res, 'Missing fields');
    }

    const category = await Category.findById(categoryId);
    if (!category) return notFound(res, 'Category not found');

    const q = await Question.create({
      text,
      answer,
      categoryId,
      difficulty,
      createdBy: req.user._id,
    });

    return created(res, { question: q });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────
// ✏️ UPDATE QUESTION
// ─────────────────────────────
const updateQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!q) return notFound(res, 'Not found');

    return success(res, { question: q });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────
// 🗑 DELETE QUESTION
// ─────────────────────────────
const deleteQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);

    if (!q) return notFound(res, 'Not found');

    await q.deleteOne();

    return success(res, {});
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};