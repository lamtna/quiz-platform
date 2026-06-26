'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./src/middleware/errorHandler');
const { notFound } = require('./src/utils/apiResponse');

const app = express();

app.set('trust proxy', 1);

/**
 * 🔐 Security
 */
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

/**
 * 📦 Body Parser
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/**
 * 📊 Logger
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

/**
 * 🚦 Rate Limit
 */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * 🧪 Health Check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * 📁 Static Admin Panel
 */
const adminPath = path.join(__dirname, 'admin');
app.use('/admin', express.static(adminPath));

/**
 * 🚨 ROUTE LOADER (FINAL FIX + DEBUG)
 * هذا أهم جزء - يكشف أي ملف خربان مباشرة
 */
const loadRoute = (name, routePath) => {
  try {
    const mod = require(routePath);

    if (!mod || typeof mod.use !== 'function') {
      console.error(`❌ ROUTE BROKEN: ${name}`, mod);
      throw new Error(`${name} is not a valid Express Router`);
    }

    console.log(`✅ ROUTE OK: ${name}`);
    return mod;

  } catch (err) {
    console.error(`🔥 FAILED TO LOAD: ${name}`);
    console.error(err.message);
    process.exit(1); // يوقف السيرفر ويبين المشكلة فوراً
  }
};

/**
 * 🌐 ROUTES (SAFE LOADING)
 */
const authRoutes = loadRoute('authRoutes', './src/routes/authRoutes');
const userRoutes = loadRoute('userRoutes', './src/routes/userRoutes');
const categoryRoutes = loadRoute('categoryRoutes', './src/routes/categoryRoutes');
const questionRoutes = loadRoute('questionRoutes', './src/routes/questionRoutes');
const gameRoutes = loadRoute('gameRoutes', './src/routes/gameRoutes');
const adminRoutes = loadRoute('adminRoutes', './src/routes/adminRoutes');

/**
 * 🔗 API ROUTES
 */
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

/**
 * ❌ 404 Handler
 */
app.use((req, res) => {
  return notFound(res, 'Route not found');
});

/**
 * 🚨 Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  return errorHandler(err, req, res, next);
});

module.exports = app;