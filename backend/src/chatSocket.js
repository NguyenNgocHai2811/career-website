const chatRepository = require('./repositories/chatRepository');
const notificationRepository = require('./repositories/notificationRepository');
const jwt = require('jsonwebtoken');

// A simple in-memory map to keep track of connected sockets
// map: userId -> socketId
const userSockets = new Map();
let socketIoInstance = null;

const initializeSockets = (io) => {
  socketIoInstance = io;
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    userSockets.set(userId, socket.id);
    console.log(`User connected: ${userId} (${socket.id})`);

    // Handle sending message
    socket.on('send_message', async (data) => {
      const { receiverId, content } = data;
      if (!receiverId || !content) return;

      try {
        const savedMsg = await chatRepository.saveMessage(userId, receiverId, content);
        if (savedMsg) {
          // Emit to sender
          socket.emit('receive_message', savedMsg);
          // Emit to receiver if online
          const receiverSocketId = userSockets.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', savedMsg);
          }
          
          // Phase 4 Hook: Create & push notification for new message
          const notificationContent = `You have a new message.`;
          const savedNotification = await notificationRepository.createNotification(
            receiverId,
            'NEW_MESSAGE',
            notificationContent,
            savedMsg.messageId
          );
          
          if (savedNotification && receiverSocketId) {
             io.to(receiverSocketId).emit('receive_notification', savedNotification);
          }
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  });
};

const sendSocketNotification = (userId, notificationData) => {
  if (!socketIoInstance) return;
  const socketId = userSockets.get(userId);
  if (socketId) {
    socketIoInstance.to(socketId).emit('receive_notification', notificationData);
  }
};

module.exports = { initializeSockets, sendSocketNotification };
