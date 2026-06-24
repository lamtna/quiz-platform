const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const {
  protect,
  adminOnly,
} = require('../middleware/auth');

const validate = require('../middleware/validate');

const {
  upload,
} = require('../config/cloudinary');

// ─────────────────────────────
// 🔐 AUTH
// ─────────────────────────────
router.use(protect);

// ─────────────────────────────
// 📂 GET ALL
// ─────────────────────────────
router.get('/', getAllCategories);

// ─────────────────────────────
// 📂 GET ONE
// ─────────────────────────────
router.get('/:id', getCategoryById);

// ─────────────────────────────
// ➕ CREATE
// ─────────────────────────────
router.post(
  '/',
  adminOnly,
  upload.single('image'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('اسم الفئة مطلوب')
      .isLength({ max: 100 })
      .withMessage(
        'اسم الفئة يجب أن يكون أقل من 100 حرف'
      ),
  ],
  validate,
  createCategory
);

// ─────────────────────────────
// ✏ UPDATE
// ─────────────────────────────
router.put(
  '/:id',
  adminOnly,
  upload.single('image'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 }),
  ],
  validate,
  updateCategory
);

// ─────────────────────────────
// 🗑 DELETE
// ─────────────────────────────
router.delete(
  '/:id',
  adminOnly,
  deleteCategory
);

module.exports = router;