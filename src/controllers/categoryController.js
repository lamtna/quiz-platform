const Category = require('../models/Category');
const Question = require('../models/Question');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');
const { getPagination } = require('../utils/pagination');
const { uploadToCloudinary, deleteFromCloudinary, getResourceType } = require('../config/cloudinary');
const { CLOUDINARY_FOLDERS } = require('../config/constants');

const getAllCategories = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isActive: true };
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    if (req.user.role === 'admin' && req.query.showAll === 'true') delete filter.isActive;

    const [categories, total] = await Promise.all([
      Category.find(filter).populate('questionCount').sort({ name: 1 }).skip(skip).limit(limit),
      Category.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'تم جلب الفئات',
      data: categories,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('questionCount');
    if (!category) return notFound(res, 'الفئة غير موجودة');
    return success(res, { category }, 'تم جلب الفئة');
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    let imageData = { url: null, publicId: null };

    // If a file was uploaded, push to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: CLOUDINARY_FOLDERS.CATEGORIES,
        resource_type: 'image',
        transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
      });
      imageData = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await Category.create({
      name,
      image: imageData,
      createdBy: req.user._id,
    });

    return created(res, { category }, 'تم إنشاء الفئة');
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return notFound(res, 'الفئة غير موجودة');

    if (name) category.name = name;
    if (isActive !== undefined) category.isActive = isActive;

    // Replace image if new file uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (category.image?.publicId) {
        await deleteFromCloudinary(category.image.publicId, 'image').catch(() => {});
      }
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: CLOUDINARY_FOLDERS.CATEGORIES,
        resource_type: 'image',
        transformation: [{ width: 800, crop: 'limit' }, { quality: 'auto' }],
      });
      category.image = { url: result.secure_url, publicId: result.public_id };
    }

    await category.save();
    return success(res, { category }, 'تم تحديث الفئة');
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return notFound(res, 'الفئة غير موجودة');

    const questionCount = await Question.countDocuments({ categoryId: category._id });
    if (questionCount > 0) {
      return badRequest(res, `لا يمكن الحذف. توجد ${questionCount} أسئلة في هذه الفئة.`);
    }

    if (category.image?.publicId) {
      await deleteFromCloudinary(category.image.publicId, 'image').catch(() => {});
    }

    await category.deleteOne();
    return success(res, {}, 'تم حذف الفئة');
  } catch (err) { next(err); }
};

module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
