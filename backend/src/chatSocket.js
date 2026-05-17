const chatRepository = require('./repositories/chatRepository');
const notificationRepository = require('./repositories/notificationRepository');
const jwt = require('jsonwebtoken');

// A simple in-memory map to keep track of connected sockets
// map: userId -> Set<socketId>
const userSockets = new Map();
let socketIoInstance = null;

const getOnlineUserIds = () => Array.from(userSockets.keys());
const normalizeUserId = (userId) => userId?.toString();
const addSocketForUser = (userId, socketId) => {
  const normalizedId = normalizeUserId(userId);
  const sockets = userSockets.get(normalizedId) || new Set();
  sockets.add(socketId);
  userSockets.set(normalizedId, sockets);
};
const removeSocketForUser = (userId, socketId) => {
  const normalizedId = normalizeUserId(userId);
  const sockets = userSockets.get(normalizedId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(normalizedId);
    return false;
  }
  userSockets.set(normalizedId, sockets);
  return true;
};
const getSocketIdsForUser = (userId) => Array.from(userSockets.get(normalizeUserId(userId)) || []);

const initializeSockets = (io) => {
  socketIoInstance = io;
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    jwt.verify(token, process.env.JWT_SECRET || 'korra_secret_key_default', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = normalizeUserId(decoded.userId);
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    addSocketForUser(userId, socket.id);
    socket.join(userId);
    console.log(`User connected: ${userId} (${socket.id})`);

    // Publish presence updates
    const onlineIds = getOnlineUserIds();
    socket.emit('online_users', onlineIds);
    io.emit('user_online', { userId });

    // Handle sending message
    socket.on('send_message', async (data) => {
      const { receiverId: rawReceiverId, content } = data;
      const receiverId = normalizeUserId(rawReceiverId);
      if (!receiverId || !content) return;

      try {
        const savedMsg = await chatRepository.saveMessage(userId, receiverId, content);
        if (savedMsg) {
          // Emit to sender
          socket.emit('receive_message', savedMsg);
          // Emit to receiver room
          io.to(receiverId).emit('receive_message', savedMsg);
          console.log(`Message sent from ${userId} to ${receiverId}`, { messageId: savedMsg.messageId });
          
          // Phase 4 Hook: Create & push notification for new message
          const notificationContent = `You have a new message.`;
          const savedNotification = await notificationRepository.createNotification(
            receiverId,
            'NEW_MESSAGE',
            notificationContent,
            savedMsg.messageId
          );
          
          if (savedNotification) {
            io.to(receiverId).emit('receive_notification', savedNotification);
          }
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      const stillOnline = removeSocketForUser(userId, socket.id);
      console.log(`User disconnected: ${userId} (${socket.id}), stillOnline=${stillOnline}`);
      if (!stillOnline) {
        io.emit('user_offline', { userId });
      }
    });
  });
};

const sendSocketNotification = (userId, notificationData) => {
  if (!socketIoInstance) return;
  socketIoInstance.to(normalizeUserId(userId)).emit('receive_notification', notificationData);
};

module.exports = { initializeSockets, sendSocketNotification };
