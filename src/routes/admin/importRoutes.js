'use strict';

const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const { uploadExcel } = require('../../controllers/admin/importController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// رفع ملف Excel واحد
router.post('/excel', upload.single('file'), uploadExcel);

module.exports = router;