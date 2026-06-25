'use strict';

require('dotenv').config();

const http = require('http');
const { app, corsOrigins } = require('./app');
const connectDB = require('./src/config/db');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);

    let io = null;

    try {
      const socketModule = require('./src/sockets/gameSocket');
      if (socketModule?.initSocket) {
        io = socketModule.initSocket(server, corsOrigins);
      }
    } catch (e) {
      console.log('Socket disabled');
    }

    server.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });

    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));

  } catch (err) {
    console.error(err);
  }
};

startServer();