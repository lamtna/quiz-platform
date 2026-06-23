const User = require('../models/User');
const Game = require('../models/Game');
const { success, notFound, badRequest } = require('../utils/apiResponse');
const { getPagination } = require('../utils/pagination');

/**
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');

    const gameCount = await Game.countDocuments({ userId: user._id });

    return success(res, { user, gameCount }, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return badRequest(res, 'Role must be "user" or "admin"');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return notFound(res, 'User not found');

    return success(res, { user }, 'User role updated');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/:id/restore-free-game
 * @access  Private/Admin
 */
const restoreFreeGame = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { hasFreeGame: true },
      { new: true }
    );

    if (!user) return notFound(res, 'User not found');

    return success(res, { user }, 'Free game restored for user');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return notFound(res, 'User not found');

    if (String(user._id) === String(req.user._id)) {
      return badRequest(res, 'You cannot delete your own account');
    }

    await user.deleteOne();
    return success(res, {}, 'User deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, restoreFreeGame, deleteUser };
