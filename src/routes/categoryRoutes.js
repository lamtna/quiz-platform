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

const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

// لازم ترتيب الميدلوير يكون مضبوط عشان req.file يوصل صح
router.use(protect);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

router.post(
  '/',
  adminOnly,
  upload.single('image'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('اسم الفئة مطلوب')
      .isLength({ max: 100 }),
  ],
  validate,
  createCategory
);

router.put(
  '/:id',
  adminOnly,
  upload.single('image'),
  [
    body('name').optional().trim().isLength({ max: 100 }),
  ],
  validate,
  updateCategory
);

router.delete('/:id', adminOnly, deleteCategory);

module.exports = router;