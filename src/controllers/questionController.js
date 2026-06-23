const Question = require('../models/Question');
const Category = require('../models/Category');
const { success, created, notFound, badRequest } = require('../utils/apiResponse');
const { getPagination } = require('../utils/pagination');
const { uploadToCloudinary, deleteFromCloudinary, getResourceType } = require('../config/cloudinary');
const { CLOUDINARY_FOLDERS } = require('../config/constants');

// ─── Upload all media files for a question ───────────────────────────────────
const uploadQuestionMedia = async (files, existingMedia = {}) => {
  const media = {
    image: existingMedia.image || { url: null, publicId: null },
    audio: existingMedia.audio || { url: null, publicId: null },
    video: existingMedia.video || { url: null, publicId: null, isReplayable: true },
  };

  if (files?.questionImage?.[0]) {
    const f = files.questionImage[0];
    if (media.image?.publicId) await deleteFromCloudinary(media.image.publicId, 'image').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'image',
    });
    media.image = { url: r.secure_url, publicId: r.public_id };
  }

  if (files?.questionAudio?.[0]) {
    const f = files.questionAudio[0];
    if (media.audio?.publicId) await deleteFromCloudinary(media.audio.publicId, 'raw').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'raw',
    });
    media.audio = { url: r.secure_url, publicId: r.public_id };
  }

  if (files?.questionVideo?.[0]) {
    const f = files.questionVideo[0];
    if (media.video?.publicId) await deleteFromCloudinary(media.video.publicId, 'video').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'video',
    });
    media.video = { url: r.secure_url, publicId: r.public_id, isReplayable: true };
  }

  return media;
};

// ─── Upload answer media files ───────────────────────────────────────────────
const uploadAnswerMedia = async (files, existingMedia = {}) => {
  const media = {
    image: existingMedia.image || { url: null, publicId: null },
    audio: existingMedia.audio || { url: null, publicId: null },
    video: existingMedia.video || { url: null, publicId: null, isReplayable: true },
  };

  if (files?.answerImage?.[0]) {
    const f = files.answerImage[0];
    if (media.image?.publicId) await deleteFromCloudinary(media.image.publicId, 'image').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'image',
    });
    media.image = { url: r.secure_url, publicId: r.public_id };
  }

  if (files?.answerAudio?.[0]) {
    const f = files.answerAudio[0];
    if (media.audio?.publicId) await deleteFromCloudinary(media.audio.publicId, 'raw').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'raw',
    });
    media.audio = { url: r.secure_url, publicId: r.public_id };
  }

  if (files?.answerVideo?.[0]) {
    const f = files.answerVideo[0];
    if (media.video?.publicId) await deleteFromCloudinary(media.video.publicId, 'video').catch(() => {});
    const r = await uploadToCloudinary(f.buffer, {
      folder: CLOUDINARY_FOLDERS.QUESTIONS,
      resource_type: 'video',
    });
    media.video = { url: r.secure_url, publicId: r.public_id, isReplayable: true };
  }

  return media;
};

const getAllQuestions = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;
    if (req.query.difficulty) filter.difficulty = Number(req.query.difficulty);
    if (req.query.used !== undefined) filter.used = req.query.used === 'true';
    if (req.query.search) filter.text = { $regex: req.query.search, $options: 'i' };

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('categoryId', 'name')
        .sort({ categoryId: 1, difficulty: 1 })
        .skip(skip)
        .limit(limit),
      Question.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true, message: 'تم جلب الأسئلة', data: questions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id).populate('categoryId', 'name');
    if (!question) return notFound(res, 'السؤال غير موجود');
    return success(res, { question }, 'تم جلب السؤال');
  } catch (err) { next(err); }
};

const createQuestion = async (req, res, next) => {
  try {
    const { categoryId, text, answer, difficulty, timer } = req.body;

    const category = await Category.findById(categoryId);
    if (!category) return notFound(res, 'الفئة غير موجودة');

    const media = await uploadQuestionMedia(req.files);
    const answerMedia = await uploadAnswerMedia(req.files);

    const question = await Question.create({
      categoryId, text, answer, difficulty,
      timer: timer || undefined,
      media, answerMedia,
      createdBy: req.user._id,
    });

    return created(res, { question }, 'تم إنشاء السؤال');
  } catch (err) { next(err); }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return notFound(res, 'السؤال غير موجود');

    const { text, answer, difficulty, timer } = req.body;
    if (text) question.text = text;
    if (answer) question.answer = answer;
    if (difficulty) question.difficulty = difficulty;
    if (timer) question.timer = timer;

    // Upload any new media files
    question.media = await uploadQuestionMedia(req.files, question.media);
    question.answerMedia = await uploadAnswerMedia(req.files, question.answerMedia);

    await question.save();
    return success(res, { question }, 'تم تحديث السؤال');
  } catch (err) { next(err); }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return notFound(res, 'السؤال غير موجود');

    // Clean up Cloudinary assets
    const assets = [
      { id: question.media?.image?.publicId, type: 'image' },
      { id: question.media?.audio?.publicId, type: 'raw' },
      { id: question.media?.video?.publicId, type: 'video' },
      { id: question.answerMedia?.image?.publicId, type: 'image' },
      { id: question.answerMedia?.audio?.publicId, type: 'raw' },
      { id: question.answerMedia?.video?.publicId, type: 'video' },
    ];
    await Promise.all(
      assets.filter((a) => a.id).map((a) => deleteFromCloudinary(a.id, a.type).catch(() => {}))
    );

    await question.deleteOne();
    return success(res, {}, 'تم حذف السؤال');
  } catch (err) { next(err); }
};

const bulkCreateQuestions = async (req, res, next) => {
  try {
    const { categoryId, questions } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) return notFound(res, 'الفئة غير موجودة');
    if (!Array.isArray(questions) || !questions.length) {
      return badRequest(res, 'يجب إرسال قائمة أسئلة');
    }
    const docs = questions.map((q) => ({ ...q, categoryId, createdBy: req.user._id }));
    const result = await Question.insertMany(docs, { ordered: false });
    return res.status(201).json({ success: true, message: `تم إنشاء ${result.length} سؤال`, data: result });
  } catch (err) { next(err); }
};

const resetQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, { used: false }, { new: true });
    if (!question) return notFound(res, 'السؤال غير موجود');
    return success(res, { question }, 'تم إعادة تعيين السؤال');
  } catch (err) { next(err); }
};

const resetCategoryQuestions = async (req, res, next) => {
  try {
    const result = await Question.updateMany(
      { categoryId: req.params.categoryId },
      { used: false }
    );
    return success(res, { modifiedCount: result.modifiedCount }, 'تم إعادة تعيين أسئلة الفئة');
  } catch (err) { next(err); }
};

module.exports = {
  getAllQuestions, getQuestionById, createQuestion, updateQuestion,
  deleteQuestion, bulkCreateQuestions, resetQuestion, resetCategoryQuestions,
};
