'use strict';

const User = require('../models/User');
const Game = require('../models/Game');
const Question = require('../models/Question');
const Category = require('../models/Category');

const emitAdminStatsUpdate = require('../sockets/adminSocket').emitAdminStatsUpdate;

/**
 * Build live dashboard stats
 */
const buildAdminStats = async () => {
  const [
    users,
    gamesActive,
    gamesFinished,
    questions,
    categories,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Game.countDocuments({ status: 'active' }),
    Game.countDocuments({ status: 'finished' }),
    Question.countDocuments(),
    Category.countDocuments(),
  ]);

  return {
    users,
    games: {
      active: gamesActive,
      finished: gamesFinished,
    },
    questions,
    categories,
    timestamp: new Date(),
  };
};

/**
 * Push update to admin dashboard
 */
const pushAdminUpdate = async () => {
  const stats = await buildAdminStats();
  emitAdminStatsUpdate(stats);
};

module.exports = {
  buildAdminStats,
  pushAdminUpdate,
};
