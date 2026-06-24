'use strict';

const User = require('../models/User');
const { success, notFound } = require('../utils/apiResponse');

/**
 * 👥 Get all users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return success(res, { users }, 'All users fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * 👤 Get user by ID
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return notFound(res, 'User not found');

    return success(res, { user }, 'User fetched');
  } catch (err) {
    next(err);
  }
};

/**
 * 🔑 Update user role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');

    user.role = role;
    await user.save();

    return success(res, { user }, 'Role updated');
  } catch (err) {
    next(err);
  }
};

/**
 * 🎮 Restore free game
 */
exports.restoreFreeGame = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');

    user.hasFreeGame = true;
    await user.save();

    return success(res, { user }, 'Free game restored');
  } catch (err) {
    next(err);
  }
};

/**
 * 🗑 Delete user
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');

    await user.deleteOne();

    return success(res, {}, 'User deleted');
  } catch (err) {
    next(err);
  }
};