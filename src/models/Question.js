const mongoose = require('mongoose');
const { DIFFICULTY_LEVELS, DEFAULT_QUESTION_TIMER } = require('../config/constants');

const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    // Media for the question prompt
    media: {
      image: { url: { type: String, default: null }, publicId: { type: String, default: null } },
      audio: { url: { type: String, default: null }, publicId: { type: String, default: null } },
      video: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        isReplayable: { type: Boolean, default: true },
      },
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
    },
    // Media shown on the answer reveal screen
    answerMedia: {
      image: { url: { type: String, default: null }, publicId: { type: String, default: null } },
      audio: { url: { type: String, default: null }, publicId: { type: String, default: null } },
      video: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        isReplayable: { type: Boolean, default: true },
      },
    },
    difficulty: {
      type: Number,
      required: [true, 'Difficulty is required'],
      enum: {
        values: DIFFICULTY_LEVELS,
        message: `Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`,
      },
    },
    timer: {
      type: Number,
      default: DEFAULT_QUESTION_TIMER,
      min: [5, 'Timer must be at least 5 seconds'],
      max: [300, 'Timer cannot exceed 300 seconds'],
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast random question queries
questionSchema.index({ categoryId: 1, difficulty: 1, used: 1 });

module.exports = mongoose.model('Question', questionSchema);
