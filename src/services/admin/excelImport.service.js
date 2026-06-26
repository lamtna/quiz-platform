'use strict';

const xlsx = require('xlsx');
const Question = require('../../models/Question');
const Category = require('../../models/Category');

/**
 * 📥 قراءة ملف Excel وتحويله JSON
 */
const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return xlsx.utils.sheet_to_json(sheet);
};

/**
 * 🧠 تحقق من البيانات
 */
const validateRow = (row, fileCategory) => {
  const errors = [];

  if (!row['السؤال']) errors.push('السؤال فارغ');
  if (!row['الجواب']) errors.push('الجواب فارغ');
  if (!row['الفئة']) errors.push('الفئة فارغة');
  if (!row['الصعوبة']) errors.push('الصعوبة مفقودة');

  const validDifficulty = [200, 400, 600, 800];
  if (!validDifficulty.includes(Number(row['الصعوبة']))) {
    errors.push('الصعوبة غير صحيحة');
  }

  if (row['الفئة'] !== fileCategory) {
    errors.push('الفئة لا تطابق اسم الملف');
  }

  return errors;
};

/**
 * 🚀 Import Excel
 */
const importExcelQuestions = async (filePath, fileCategory) => {
  const rows = parseExcelFile(filePath);

  let valid = [];
  let invalid = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors = validateRow(row, fileCategory);

    if (errors.length > 0) {
      invalid.push({
        row: i + 2,
        errors,
      });
      continue;
    }

    valid.push({
      text: row['السؤال'],
      answer: row['الجواب'],
      category: row['الفئة'],
      difficulty: Number(row['الصعوبة']),
      points: Number(row['النقاط']),
    });
  }

  // حفظ البيانات الصحيحة
  const categoryDoc = await Category.findOne({ name: fileCategory });

  if (!categoryDoc) {
    throw new Error('Category not found in DB');
  }

  const questionsToInsert = valid.map((q) => ({
    text: q.text,
    answer: q.answer,
    categoryId: categoryDoc._id,
    difficulty: q.difficulty,
    points: q.points,
  }));

  if (questionsToInsert.length > 0) {
    await Question.insertMany(questionsToInsert);
  }

  return {
    total: rows.length,
    success: valid.length,
    failed: invalid.length,
    errors: invalid,
  };
};

module.exports = {
  importExcelQuestions,
};