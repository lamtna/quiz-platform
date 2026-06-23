const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAllQuestions, getQuestionById, createQuestion, updateQuestion,
  deleteQuestion, bulkCreateQuestions, resetQuestion, resetCategoryQuestions,
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');
const { DIFFICULTY_LEVELS } = require('../config/constants');

const mediaFields = upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'questionAudio', maxCount: 1 },
  { name: 'questionVideo', maxCount: 1 },
  { name: 'answerImage', maxCount: 1 },
  { name: 'answerAudio', maxCount: 1 },
  { name: 'answerVideo', maxCount: 1 },
]);

const qValidation = [
  body('text').trim().notEmpty().withMessage('نص السؤال مطلوب'),
  body('answer').trim().notEmpty().withMessage('الإجابة مطلوبة'),
  body('difficulty').isIn(DIFFICULTY_LEVELS).withMessage(`الصعوبة يجب أن تكون: ${DIFFICULTY_LEVELS.join(', ')}`),
  body('categoryId').isMongoId().withMessage('معرف الفئة غير صالح'),
  body('timer').optional().isInt({ min: 5, max: 300 }),
];

router.use(protect);
router.get('/', adminOnly, getAllQuestions);
router.get('/:id', getQuestionById);
router.post('/bulk', adminOnly, bulkCreateQuestions);
router.post('/', adminOnly, mediaFields, qValidation, validate, createQuestion);
router.put('/:id', adminOnly, mediaFields, updateQuestion);
router.post('/:id/reset', adminOnly, resetQuestion);
router.post('/reset-category/:categoryId', adminOnly, resetCategoryQuestions);
router.delete('/:id', adminOnly, deleteQuestion);
module.exports = router;
