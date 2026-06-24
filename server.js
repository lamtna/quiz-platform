'use strict';

require('dotenv').config();

const http = require('http');
const { app, corsOrigins } = require('./app');
const connectDB = require('./src/config/db');

const { initSocket } = require('./src/sockets/gameSocket');
const { setIo } = require('./src/sockets');

const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

/**
 * ─────────────────────────────
 * 🚀 START SERVER
 * ─────────────────────────────
 */
const startServer = async () => {
  try {
    // DB
    await connectDB();
    console.log('🟢 MongoDB connected');

    // HTTP server
    const server = http.createServer(app);

    // Socket.io init
    const io = initSocket(server, corsOrigins);
    setIo(io);

    console.log('🔌 Socket.io initialized');

    // Start listening
    server.listen(PORT, () => {
      console.log(`\n🚀 Quiz Platform API v2.0`);
      console.log(`   ├─ REST API:    http://localhost:${PORT}/api`);
      console.log(`   ├─ Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`   ├─ Health:      http://localhost:${PORT}/health`);
      console.log(`   └─ Socket.io:   ws://localhost:${PORT}\n`);
    });

    /**
     * ─────────────────────────────
     * 🛑 GRACEFUL SHUTDOWN
     * ─────────────────────────────
     */
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await mongoose.connection.close();
        console.log('🟢 MongoDB connection closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    /**
     * ─────────────────────────────
     * ❌ ERROR HANDLING
     * ─────────────────────────────
     */
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();