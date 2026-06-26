const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * 🚀 SaaS CLEAN INDEXES
 */
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });
categorySchema.index({ isActive: 1 });

/**
 * Virtual
 */
categorySchema.virtual('questionCount', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'categoryId',
  count: true,
});

/**
 * Auto Slug
 */
categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);