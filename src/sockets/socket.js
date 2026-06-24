import { io } from "socket.io-client";

/**
 * 🎮 Socket Singleton
 * يمنع إنشاء أكثر من اتصال
 */

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io("http://localhost:5000", {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  // ───── Connection Events ─────
  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.log("⚠️ Socket error:", err.message);
  });

  return socket;
};

/**
 * 🔥 Get socket instance
 */
export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};

/**
 * 🧹 Disconnect
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};