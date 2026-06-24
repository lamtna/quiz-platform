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

    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    image: {
      url: {
        type: String,
        default: null,
      },

      publicId: {
        type: String,
        default: null,
      },
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * Indexes
 */
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

/**
 * Question Count
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
  if (
    this.isModified('name') ||
    !this.slug
  ) {
    this.slug = this.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  next();
});

module.exports = mongoose.model(
  'Category',
  categorySchema
);