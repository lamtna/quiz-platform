const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },

    hasFreeGame: {
      type: Boolean,
      default: true,
    },

    refreshTokenVersion: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
userSchema.index({ role: 1 });

/**
 * Hash password
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare password
 */
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 * Logout all sessions
 */
userSchema.methods.revokeTokens = async function () {
  this.refreshTokenVersion =
    (this.refreshTokenVersion || 0) + 1;

  await this.save({ validateBeforeSave: false });
};

/**
 * Clean output
 */
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.refreshTokenVersion;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);