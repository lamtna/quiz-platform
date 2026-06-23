const { SOCKET_EVENTS } = require('../config/constants');

/**
 * Initialize Socket.io with the HTTP server.
 * Returns the io instance so controllers can emit to rooms.
 *
 * Room naming: each game gets a room named `game:<gameId>`.
 * Players join by emitting `join_game` with their gameId.
 */
const initSocket = (server, corsOrigins) => {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─── Auth middleware for socket connections ───
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      // Allow unauthenticated connections for spectating
      socket.data.userId = null;
      return next();
    }
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.userId = decoded.id;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.data.userId || 'guest'})`);

    // ── JOIN GAME ROOM ──────────────────────────────────────────────────
    socket.on(SOCKET_EVENTS.JOIN_GAME, ({ gameId }) => {
      if (!gameId) return;
      socket.join(`game:${gameId}`);
      socket.data.gameId = gameId;
      console.log(`   ↳ Joined room: game:${gameId}`);

      // Notify others in room
      socket.to(`game:${gameId}`).emit(SOCKET_EVENTS.PLAYER_JOINED, {
        socketId: socket.id,
        userId: socket.data.userId,
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (err) => {
      console.error(`Socket error (${socket.id}):`, err.message);
    });
  });

  return io;
};

// ─── Emit helpers used by controllers ────────────────────────────────────────

/**
 * Emit game_created to the game's room.
 */
const emitGameCreated = (io, game) => {
  io.to(`game:${game._id}`).emit(SOCKET_EVENTS.GAME_CREATED, {
    gameId: game._id,
    gameName: game.gameName,
    teamAName: game.teamAName,
    teamBName: game.teamBName,
    categories: game.categories,
    board: game.board,
    score: game.score,
  });
};

/**
 * Emit question_selected — does NOT include the answer.
 */
const emitQuestionSelected = (io, gameId, payload) => {
  io.to(`game:${gameId}`).emit(SOCKET_EVENTS.QUESTION_SELECTED, payload);
};

/**
 * Emit answer_revealed — includes answer + media + score delta.
 */
const emitAnswerRevealed = (io, gameId, payload) => {
  io.to(`game:${gameId}`).emit(SOCKET_EVENTS.ANSWER_REVEALED, payload);
};

/**
 * Emit score_updated after a point change.
 */
const emitScoreUpdated = (io, gameId, score) => {
  io.to(`game:${gameId}`).emit(SOCKET_EVENTS.SCORE_UPDATED, { score });
};

/**
 * Emit game_finished with final results.
 */
const emitGameFinished = (io, gameId, payload) => {
  io.to(`game:${gameId}`).emit(SOCKET_EVENTS.GAME_FINISHED, payload);
};

module.exports = {
  initSocket,
  emitGameCreated,
  emitQuestionSelected,
  emitAnswerRevealed,
  emitScoreUpdated,
  emitGameFinished,
};
