'use strict';

const User = require('../models/User');
const { success, notFound } = require('../utils/apiResponse');

/* GET ALL USERS */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return success(res, { users }, 'ok');
  } catch (err) {
    next(err);
  }
};

/* GET USER */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'not found');
    return success(res, { user }, 'ok');
  } catch (err) {
    next(err);
  }
};

/* UPDATE ROLE */
const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'not found');

    user.role = req.body.role;
    await user.save();

    return success(res, { user }, 'updated');
  } catch (err) {
    next(err);
  }
};

/* RESTORE GAME */
const restoreFreeGame = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'not found');

    user.hasFreeGame = true;
    await user.save();

    return success(res, { user }, 'restored');
  } catch (err) {
    next(err);
  }
};

/* DELETE USER */
const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return success(res, {}, 'deleted');
  } catch (err) {
    next(err);
  }
};

/* REFRESH TOKEN */
const refreshToken = require('./tokenController').refreshToken;

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  restoreFreeGame,
  deleteUser,
  refreshToken,
};