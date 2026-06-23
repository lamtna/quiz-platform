const User = require('../models/User');
const Category = require('../models/Category');
const Question = require('../models/Question');
const Game = require('../models/Game');
const { success } = require('../utils/apiResponse');
const { GAME_STATUS, DIFFICULTY_LEVELS } = require('../config/constants');

/**
 * @route   GET /api/admin/stats
 * @access  Admin
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
      usedQuestions,
      recentGames,
      questionsByDifficulty,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Category.countDocuments({ isActive: true }),
      Question.countDocuments(),
      Game.countDocuments(),
      Game.countDocuments({ status: GAME_STATUS.ACTIVE }),
      Game.countDocuments({ status: GAME_STATUS.FINISHED }),
      Question.countDocuments({ used: true }),
      Game.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .select('gameName teamAName teamBName status score winner createdAt'),
      Question.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 }, used: { $sum: { $cond: ['$used', 1, 0] } } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return success(res, {
      stats: {
        users: totalUsers,
        categories: totalCategories,
        questions: {
          total: totalQuestions,
          used: usedQuestions,
          available: totalQuestions - usedQuestions,
        },
        games: {
          total: totalGames,
          active: activeGames,
          finished: finishedGames,
        },
      },
      questionsByDifficulty,
      recentGames,
    }, 'إحصائيات لوحة التحكم');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboardStats };
