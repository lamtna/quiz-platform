'use strict';

require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

/**
 * 🚀 Start Server
 */
const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    /**
     * ✅ SOCKET INITIALIZATION (safe placeholder)
     * إذا عندك setIo لاحقاً بنضيفه هنا
     */
    try {
      const { setIo } = require('./src/sockets');
      if (typeof setIo === 'function') {
        setIo(server, process.env.CORS_ORIGINS?.split(',') || ['*']);
      }
    } catch (err) {
      console.log('⚠️ Socket not initialized yet:', err.message);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

    /**
     * 🧹 Graceful shutdown
     */
    const shutdown = () => {
      console.log('🛑 Shutting down server...');
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Server Error:', err);
    process.exit(1);
  }
};

startServer();