'use strict';

const { initSocket } = require('./gameSocket');
const { initAdminSocket } = require('./adminSocket');

let io;

const setIo = (server, corsOrigins) => {
  const gameIO = initSocket(server, corsOrigins);
  const adminIO = initAdminSocket(server, corsOrigins);

  io = { gameIO, adminIO };

  return io;
};

const getIo = () => io?.gameIO;

module.exports = {
  setIo,
  getIo,
};