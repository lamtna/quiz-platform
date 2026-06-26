'use strict';

const path = require('path');
const excelService = require('../../services/admin/excelImport.service');

exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // اسم الفئة من اسم الملف
    const fileName = path.parse(req.file.originalname).name;

    const result = await excelService.importExcelQuestions(
      req.file.path,
      fileName
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    next(err);
  }
};