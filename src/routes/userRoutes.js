'use strict';

const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserRole,
  restoreFreeGame,
  deleteUser,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/auth');

// 🔐 حماية كل المسارات
router.use(protect);

// 👥 Users
router.get('/', adminOnly, getAllUsers);
router.get('/:id', adminOnly, getUserById);

// ✏️ role update
router.put('/:id/role', adminOnly, updateUserRole);

// ♻️ restore game
router.put('/:id/restore-game', adminOnly, restoreFreeGame);

// 🗑 delete
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;