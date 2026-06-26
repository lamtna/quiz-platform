'use strict';

const Question = require('../models/Question');
const Category = require('../models/Category');

const {
  success,
  created,
  notFound,
  badRequest,
} = require('../utils/apiResponse');

/**
 * 📌 GET ALL QUESTIONS
 */
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

/**
 * 📌 GET QUESTION BY ID
 */
const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate(
      'categoryId',
      'name'
    );

    if (!question) return notFound(res, 'Question not found');

    return success(res, { question });
  } catch (err) {
    next(err);
  }
};

/**
 * 📌 CREATE QUESTION
 */
const createQuestion = async (req, res, next) => {
  try {
    const { text, answer, categoryId, difficulty } = req.body;

    if (!text || !answer || !categoryId) {
      return badRequest(res, 'Missing required fields');
    }

    // تأكد من وجود الكاتيجوري
    const category = await Category.findById(categoryId);
    if (!category) return notFound(res, 'Category not found');

    const question = await Question.create({
      text,
      answer,
      categoryId,
      difficulty,
      createdBy: req.user?._id,
    });

    return created(res, { question }, 'Question created');
  } catch (err) {
    next(err);
  }
};

/**
 * 📌 UPDATE QUESTION
 */
const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!question) return notFound(res, 'Question not found');

    return success(res, { question }, 'Question updated');
  } catch (err) {
    next(err);
  }
};

/**
 * 📌 DELETE QUESTION
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) return notFound(res, 'Question not found');

    await question.deleteOne();

    return success(res, {}, 'Question deleted');
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