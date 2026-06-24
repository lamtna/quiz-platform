'use strict';

const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/admin/dashboardController');

router.use(protect, adminOnly);

/**
 * 📊 Dashboard main stats
 */
router.get('/stats', getDashboardStats);

module.exports = router;