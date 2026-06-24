'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./src/middleware/errorHandler');
const { notFound: notFoundResponse } = require('./src/utils/apiResponse');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

/**
 * ─────────────────────────────
 * 🧠 TRUST PROXY (important for deploy)
 * ─────────────────────────────
 */
app.set('trust proxy', 1);

/**
 * ─────────────────────────────
 * 🔐 SECURITY HEADERS
 * ─────────────────────────────
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

/**
 * ─────────────────────────────
 * 🌐 CORS CONFIG (API + SOCKET READY)
 * ─────────────────────────────
 */
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * ─────────────────────────────
 * 🚦 RATE LIMITING
 * ─────────────────────────────
 */
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'طلبات كثيرة. حاول لاحقاً.',
  },
});

app.use('/api', limiter);

/**
 * ─────────────────────────────
 * 📦 BODY PARSING
 * ─────────────────────────────
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * ─────────────────────────────
 * 📊 LOGGING
 * ─────────────────────────────
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * ─────────────────────────────
 * 🖥️ ADMIN STATIC PANEL
 * ─────────────────────────────
 */
app.use('/admin', express.static(path.join(__dirname, 'admin')));

/**
 * ─────────────────────────────
 * ❤️ HEALTH CHECK
 * ─────────────────────────────
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * ─────────────────────────────
 * 🔌 API ROUTES
 * ─────────────────────────────
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

/**
 * ─────────────────────────────
 * ❌ 404 HANDLER
 * ─────────────────────────────
 */
app.use((req, res) => {
  notFoundResponse(res, `المسار ${req.originalUrl} غير موجود`);
});

/**
 * ─────────────────────────────
 * 🚨 GLOBAL ERROR HANDLER
 * ─────────────────────────────
 */
app.use(errorHandler);

/**
 * ─────────────────────────────
 * ⚡ SOCKET HOOK (IMPORTANT FOR GAME)
 * ─────────────────────────────
 * هذا المكان يتم استخدامه في server.js
 * app.set('io', io)
 */
app.set('io', null);

module.exports = { app, corsOrigins };