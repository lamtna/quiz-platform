'use strict';

const { SOCKET_EVENTS } = require('../config/constants');
const jwt = require('jsonwebtoken');

const ROOM_PREFIX = 'game:';

let ioInstance = null;

/**
 * ─────────────────────────────
 * ⚡ INIT SOCKET.IO
 * ─────────────────────────────
 */
const initSocket = (server, corsOrigins) => {
  const { Server } = require('socket.io');

  if (ioInstance) return ioInstance;

  const io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  ioInstance = io;

  /**
   * ─────────────────────────────
   * 🔐 AUTH MIDDLEWARE
   * ─────────────────────────────
   */
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      socket.data.userId = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.id;
      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  /**
   * ─────────────────────────────
   * 🔌 CONNECTION
   * ─────────────────────────────
   */
  io.on('connection', (socket) => {
    console.log(`🔌 connected: ${socket.id}`);

    /**
     * 👥 JOIN GAME
     */
    socket.on(SOCKET_EVENTS.JOIN_GAME, ({ gameId }) => {
      if (!gameId) return;

      const room = `${ROOM_PREFIX}${gameId}`;

      socket.join(room);
      socket.data.gameId = gameId;

      console.log(`↳ joined ${room}`);

      socket.to(room).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        socketId: socket.id,
        userId: socket.data.userId,
      });
    });

    /**
     * ❌ DISCONNECT
     */
    socket.on('disconnect', (reason) => {
      console.log(`🔌 disconnected: ${socket.id} (${reason})`);

      const gameId = socket.data.gameId;
      if (gameId) {
        socket.to(`${ROOM_PREFIX}${gameId}`).emit(
          SOCKET_EVENTS.PLAYER_LEFT,
          {
            socketId: socket.id,
            userId: socket.data.userId,
          }
        );
      }
    });

    /**
     * 🚨 ERROR
     */
    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}):`, err.message);
    });
  });

  return io;
};

/**
 * ─────────────────────────────
 * 🧠 ROOM HELPER
 * ─────────────────────────────
 */
const getRoom = (gameId) => `${ROOM_PREFIX}${gameId}`;

/**
 * ─────────────────────────────
 * 🎮 EMIT HELPERS
 * ─────────────────────────────
 */

const emitGameCreated = (io, game) => {
  io.to(getRoom(game._id)).emit(SOCKET_EVENTS.GAME_CREATED, {
    gameId: game._id,
    gameName: game.gameName,
    teamAName: game.teamAName,
    teamBName: game.teamBName,
    categories: game.categories,
    board: game.board,
    score: game.score,
  });
};

const emitQuestionSelected = (io, gameId, payload) => {
  io.to(getRoom(gameId)).emit(
    SOCKET_EVENTS.QUESTION_SELECTED,
    payload
  );
};

const emitAnswerRevealed = (io, gameId, payload) => {
  io.to(getRoom(gameId)).emit(
    SOCKET_EVENTS.ANSWER_REVEALED,
    payload
  );
};

const emitScoreUpdated = (io, gameId, score) => {
  io.to(getRoom(gameId)).emit(
    SOCKET_EVENTS.SCORE_UPDATED,
    { score }
  );
};

const emitGameFinished = (io, gameId, payload) => {
  io.to(getRoom(gameId)).emit(
    SOCKET_EVENTS.GAME_FINISHED,
    payload
  );
};

module.exports = {
  initSocket,
  emitGameCreated,
  emitQuestionSelected,
  emitAnswerRevealed,
  emitScoreUpdated,
  emitGameFinished,
  getRoom,
};