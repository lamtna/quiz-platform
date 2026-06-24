const Category = require('../models/Category');
const Question = require('../models/Question');
const {
  success,
  created,
  notFound,
  badRequest,
} = require('../utils/apiResponse');

const { getPagination } = require('../utils/pagination');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');

const { CLOUDINARY_FOLDERS } = require('../config/constants');

const getAllCategories = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const filter = {};

    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: 'i',
      };
    }

    if (
      req.user.role !== 'admin' ||
      req.query.showAll !== 'true'
    ) {
      filter.isActive = true;
    }

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Category.countDocuments(filter),
    ]);

    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const questionCount =
          await Question.countDocuments({
            categoryId: category._id,
          });

        return {
          ...category,
          questionCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'تم جلب الفئات',
      data: categoriesWithStats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(
      req.params.id
    ).lean();

    if (!category) {
      return notFound(res, 'الفئة غير موجودة');
    }

    const questionCount =
      await Question.countDocuments({
        categoryId: category._id,
      });

    return success(
      res,
      {
        category: {
          ...category,
          questionCount,
        },
      },
      'تم جلب الفئة'
    );
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existingCategory =
      await Category.findOne({
        name: name.trim(),
      });

    if (existingCategory) {
      return badRequest(
        res,
        'الفئة موجودة مسبقاً'
      );
    }

    let imageData = {
      url: null,
      publicId: null,
    };

    if (req.file) {
      const result =
        await uploadToCloudinary(
          req.file.buffer,
          {
            folder:
              CLOUDINARY_FOLDERS.CATEGORIES,
            resource_type: 'image',
          }
        );

      imageData = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const category = await Category.create({
      name: name.trim(),
      image: imageData,
      createdBy: req.user._id,
    });

    return created(
      res,
      { category },
      'تم إنشاء الفئة'
    );
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return notFound(
        res,
        'الفئة غير موجودة'
      );
    }

    if (name) {
      category.name = name.trim();
    }

    if (typeof isActive !== 'undefined') {
      category.isActive = isActive;
    }

    if (req.file) {
      if (category.image?.publicId) {
        await deleteFromCloudinary(
          category.image.publicId,
          'image'
        ).catch(() => {});
      }

      const result =
        await uploadToCloudinary(
          req.file.buffer,
          {
            folder:
              CLOUDINARY_FOLDERS.CATEGORIES,
            resource_type: 'image',
          }
        );

      category.image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    await category.save();

    return success(
      res,
      { category },
      'تم تحديث الفئة'
    );
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return notFound(
        res,
        'الفئة غير موجودة'
      );
    }

    const questionCount =
      await Question.countDocuments({
        categoryId: category._id,
      });

    if (questionCount > 0) {
      return badRequest(
        res,
        `لا يمكن حذف الفئة لأنها تحتوي على ${questionCount} سؤال`
      );
    }

    if (category.image?.publicId) {
      await deleteFromCloudinary(
        category.image.publicId,
        'image'
      ).catch(() => {});
    }

    await category.deleteOne();

    return success(
      res,
      {},
      'تم حذف الفئة'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};