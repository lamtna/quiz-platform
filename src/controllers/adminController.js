'use strict';

const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');
const Game = require('../models/Game');

const { success } = require('../utils/apiResponse');
const { GAME_STATUS } = require('../config/constants');

/**
 * 📊 ADMIN DASHBOARD STATS (ENHANCED)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCategories,
      totalQuestions,
      totalGames,
      activeGames,
      finishedGames,
      recentGames,
      questionsByDifficulty,
      topCategories,
      gameProgressStats,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),

      Category.countDocuments({ isActive: true }),

      Question.countDocuments(),

      Game.countDocuments(),

      Game.countDocuments({ status: GAME_STATUS.ACTIVE }),

      Game.countDocuments({ status: GAME_STATUS.FINISHED }),

      Game.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .select('gameName teamAName teamBName status score winner createdAt'),

      Question.aggregate([
        {
          $group: {
            _id: '$difficulty',
            total: { $sum: 1 },
            used: { $sum: { $cond: ['$used', 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Question.aggregate([
        {
          $group: {
            _id: '$categoryId',
            totalQuestions: { $sum: 1 },
          },
        },
        { $sort: { totalQuestions: -1 } },
        { $limit: 5 },
      ]),

      Game.aggregate([
        {
          $project: {
            total: { $size: '$board' },
            answered: {
              $size: {
                $filter: {
                  input: '$board',
                  as: 'b',
                  cond: { $eq: ['$$b.isAnswered', true] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            avgProgress: {
              $avg: {
                $cond: [
                  { $eq: ['$total', 0] },
                  0,
                  { $divide: ['$answered', '$total'] },
                ],
              },
            },
          },
        },
      ]),
    ]);

    return success(
      res,
      {
        overview: {
          users: totalUsers,
          categories: totalCategories,
          questions: totalQuestions,
          games: {
            total: totalGames,
            active: activeGames,
            finished: finishedGames,
          },
        },

        questionsByDifficulty,

        topCategories,

        gameProgress: gameProgressStats?.[0]?.avgProgress || 0,

        recentGames,
      },
      'Dashboard stats loaded successfully'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };