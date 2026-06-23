/**
 * io singleton — set once in server.js, imported by controllers.
 * This avoids circular dependencies when controllers need to emit events.
 */
let _io = null;

const setIo = (io) => { _io = io; };
const getIo = () => {
  if (!_io) throw new Error('Socket.io not initialized. Call setIo(io) first.');
  return _io;
};

module.exports = { setIo, getIo };
