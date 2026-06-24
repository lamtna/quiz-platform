'use strict';

const { Server } = require('socket.io');

let io;

/**
 * Initialize Admin Socket
 */
const initAdminSocket = (server, corsOrigins) => {
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Admin connected: ${socket.id}`);

    socket.on('admin:join', () => {
      socket.join('admin-room');
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Admin disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Emit live stats update
 */
const emitAdminStatsUpdate = (data) => {
  if (!io) return;
  io.to('admin-room').emit('admin:stats:update', data);
};

module.exports = {
  initAdminSocket,
  emitAdminStatsUpdate,
};