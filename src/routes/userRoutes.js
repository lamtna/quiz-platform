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

// All user routes require auth + admin
router.use(protect, adminOnly);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.post('/:id/restore-free-game', restoreFreeGame);
router.delete('/:id', deleteUser);

module.exports = router;
