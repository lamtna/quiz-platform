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

/**
 * 🔐 All routes below are protected + admin only
 */
router.use(protect);
router.use(adminOnly);

// الأفضل نخلي الروتات الخاصة أولاً قبل الـ :id العام
router.put('/:id/role', updateUserRole);
router.post('/:id/restore-free-game', restoreFreeGame);

// dynamic route بعد الخاص
router.get('/:id', getUserById);

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

module.exports = router;