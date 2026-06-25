'use strict';

const express = require('express');
const router = express.Router();

// 🚫 admin disabled temporarily to stabilize core system
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin module temporarily disabled',
  });
});

module.exports = router;