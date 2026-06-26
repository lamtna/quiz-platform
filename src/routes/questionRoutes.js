'use strict';

const express = require('express');
const router = express.Router();

const questionController = require('../controllers/questionController');

const { protect, adminOnly } = require('../middleware/auth');

// حماية
router.use(protect);

// فحص سريع عشان ما يطيح السيرفر
const safe = (fn) => (req, res, next) => {
  if (typeof questionController[fn] !== 'function') {
    return res.status(500).json({
      success: false,
      message: `${fn} missing in controller`
    });
  }
  return questionController[fn](req, res, next);
};

router.get('/', safe('getAllQuestions'));
router.get('/:id', safe('getQuestionById'));

router.post('/', adminOnly, safe('createQuestion'));
router.put('/:id', adminOnly, safe('updateQuestion'));
router.delete('/:id', adminOnly, safe('deleteQuestion'));

module.exports = router;