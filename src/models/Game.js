const mongoose = require('mongoose');
const {
  GAME_STATUS,
  REQUIRED_CATEGORIES,
  DIFFICULTY_LEVELS,
} = require('../config/constants');

const boardCellSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    categoryName: {
      type: String,
      required: true,
    },

    difficulty: {
      type: Number,
      enum: DIFFICULTY_LEVELS,
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      default: null,
    },

    isAnswered: {
      type: Boolean,
      default: false,
    },

    answeredBy: {
      type: String,
      enum: ['teamA', 'teamB', null],
      default: null,
    },

    pointsAwarded: {
      type: Number,
      default: 0,
    },

    // تحسين مهم
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    gameName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    teamAName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    teamBName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    categories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      validate: {
        validator: (v) => v.length === REQUIRED_CATEGORIES,
        message: `Exactly ${REQUIRED_CATEGORIES} categories required`,
      },
    },

    board: [boardCellSchema],

    status: {
      type: String,
      enum: Object.values(GAME_STATUS),
      default: GAME_STATUS.ACTIVE,
      index: true,
    },

    score: {
      teamA: { type: Number, default: 0 },
      teamB: { type: Number, default: 0 },
    },

    winner: {
      type: String,
      enum: ['teamA', 'teamB', 'tie', null],
      default: null,
    },

    currentQuestion: {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        default: null,
      },
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
      },
      difficulty: { type: Number, default: null },
      startedAt: { type: Date, default: null },
      duration: { type: Number, default: null },
    },

    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Indexes
 */
gameSchema.index({ userId: 1, status: 1 });

/**
 * Virtuals
 */
gameSchema.virtual('totalAnswered').get(function () {
  return this.board.filter((c) => c.isAnswered).length;
});

gameSchema.virtual('totalCells').get(function () {
  return this.board.length;
});

gameSchema.virtual('progressPercent').get(function () {
  if (!this.board.length) return 0;
  return Math.round((this.totalAnswered / this.totalCells) * 100);
});

module.exports = mongoose.model('Game', gameSchema);