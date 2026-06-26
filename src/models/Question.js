const mongoose = require('mongoose');
const {
  DIFFICULTY_LEVELS,
  DEFAULT_QUESTION_TIMER,
} = require('../config/constants');

const questionSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    media: {
      image: { url: String, publicId: String },
      audio: { url: String, publicId: String },
      video: {
        url: String,
        publicId: String,
        isReplayable: { type: Boolean, default: true },
      },
    },

    answer: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    answerMedia: {
      image: { url: String, publicId: String },
      audio: { url: String, publicId: String },
      video: {
        url: String,
        publicId: String,
        isReplayable: { type: Boolean, default: true },
      },
    },

    difficulty: {
      type: Number,
      required: true,
      enum: DIFFICULTY_LEVELS,
    },

    timer: {
      type: Number,
      default: DEFAULT_QUESTION_TIMER,
      min: 5,
      max: 300,
    },

    used: {
      type: Boolean,
      default: false,
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

/**
 * 🚀 SaaS INDEXES (OPTIMIZED)
 */
questionSchema.index({ categoryId: 1, difficulty: 1, used: 1 });
questionSchema.index({ text: 'text' });
questionSchema.index({ used: 1 });

module.exports = mongoose.model('Question', questionSchema);