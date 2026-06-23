const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // (اختياري احترافي)
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
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
categorySchema.index({ name: 1 });

/**
 * Virtual: question count
 */
categorySchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

module.exports = mongoose.model('Category', categorySchema);