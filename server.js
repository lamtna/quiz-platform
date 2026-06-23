require('dotenv').config();

const http = require('http');
const { app, corsOrigins } = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/gameSocket');
const { setIo } = require('./src/sockets');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Create HTTP server so both Express and Socket.io share it
  const server = http.createServer(app);

  // Init Socket.io and store singleton
  const io = initSocket(server, corsOrigins);
  setIo(io);
  console.log('🔌 Socket.io initialized');

  server.listen(PORT, () => {
    console.log(`\n🚀 Quiz Platform API v2.0`);
    console.log(`   ├─ REST API:    http://localhost:${PORT}/api`);
    console.log(`   ├─ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`   ├─ Health:      http://localhost:${PORT}/health`);
    console.log(`   └─ Socket.io:   ws://localhost:${PORT}\n`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
