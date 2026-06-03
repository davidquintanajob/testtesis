const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const onlineUsers = new Map();

const normalizeUserId = (value) => String(value ?? '').trim();

function getPresenceSnapshot(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const sockets = onlineUsers.get(normalizedUserId) || new Set();

  return {
    userId: normalizedUserId,
    connected: sockets.size > 0,
    socketCount: sockets.size,
    timestamp: new Date().toISOString(),
  };
}

function emitPresenceUpdate(userId) {
  if (!io) {
    return;
  }

  const payload = getPresenceSnapshot(userId);
  io.to(`user:${payload.userId}`).emit('presence:update', payload);
  io.to(`presence:${payload.userId}`).emit('presence:update', payload);
}

function registerSocketConnection(socket) {
  const userId = normalizeUserId(socket.user?.userId);

  if (!userId) {
    return;
  }

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socket.id);
  socket.data.userId = userId;

  socket.join(`user:${userId}`);
  socket.join(`presence:${userId}`);

  console.log(`[Socket.IO] Usuario ${userId} conectado. Socket ID: ${socket.id} -> Unido a salas: user:${userId}, presence:${userId}`);
  emitPresenceUpdate(userId);
  socket.emit('presence:connected', getPresenceSnapshot(userId));
}

function unregisterSocketConnection(socket) {
  const userId = normalizeUserId(socket.data?.userId || socket.user?.userId);

  if (!userId || !onlineUsers.has(userId)) {
    return;
  }

  const sockets = onlineUsers.get(userId);
  sockets.delete(socket.id);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
  }

  console.log(`[Socket.IO] Usuario ${userId} desconectado. Socket ID: ${socket.id}`);
  emitPresenceUpdate(userId);
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_OPTIONS || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  io.use((socket, next) => {
    try {
      console.log('[Socket.IO] Nueva conexión entrante, verificando token...');

      const token =
        (socket.handshake.auth && socket.handshake.auth.token) ||
        (socket.handshake.query && socket.handshake.query.token);

      if (!token) {
        console.log('[Socket.IO] Error: Token no proporcionado');
        return next(new Error('Token de autenticación no proporcionado en Socket.IO'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        userId: decoded.userId || decoded.id_usuario,
        nombre: decoded.nombre,
        nombre_usuario: decoded.nombre_usuario,
        rol: decoded.rol,
      };

      if (!socket.user.userId) {
        console.log('[Socket.IO] Error: Token no contiene userId válido', decoded);
        return next(new Error('Token de Socket.IO sin userId válido'));
      }

      return next();
    } catch (error) {
      console.log('[Socket.IO] Error al verificar token:', error.message);
      return next(new Error('Token de Socket.IO inválido o expirado'));
    }
  });

  io.on('connection', (socket) => {
    registerSocketConnection(socket);

    socket.on('presence:subscribe', ({ userIds } = {}) => {
      const normalizedIds = Array.isArray(userIds)
        ? userIds.map(normalizeUserId).filter(Boolean)
        : normalizeUserId(userIds)
          ? [normalizeUserId(userIds)]
          : [];

      normalizedIds.forEach((userId) => {
        socket.join(`presence:${userId}`);
      });

      const payload = normalizedIds.length > 0
        ? normalizedIds.map((userId) => getPresenceSnapshot(userId))
        : [getPresenceSnapshot(socket.user?.userId)];

      socket.emit('presence:bulk', payload);
    });

    socket.on('presence:status', ({ userId } = {}) => {
      const targetUserId = normalizeUserId(userId || socket.user?.userId);
      if (!targetUserId) {
        socket.emit('presence:status', {
          userId: null,
          connected: false,
          socketCount: 0,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      socket.emit('presence:status', getPresenceSnapshot(targetUserId));
    });

    socket.on('disconnect', () => {
      unregisterSocketConnection(socket);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};