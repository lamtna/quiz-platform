import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

/* ─────────────────────────────
   JOIN ROOM
───────────────────────────── */
export const joinGameRoom = (gameId) => {
  socket.emit("join_game", { gameId });
};

/* ─────────────────────────────
   LISTENERS
───────────────────────────── */

export const onGameStarted = (cb) => {
  socket.on("gameStarted", cb);
};

export const onNewQuestion = (cb) => {
  socket.on("newQuestion", cb);
};

export const onAnswerResult = (cb) => {
  socket.on("answerResult", cb);
};

export const onGameFinished = (cb) => {
  socket.on("gameFinished", cb);
};

/* ─────────────────────────────
   CLEANUP
───────────────────────────── */
export const removeAllListeners = () => {
  socket.off("gameStarted");
  socket.off("newQuestion");
  socket.off("answerResult");
  socket.off("gameFinished");
};

export default socket;