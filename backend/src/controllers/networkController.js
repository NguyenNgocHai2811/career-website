const networkRepository = require('../repositories/networkRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { sendSocketNotification } = require('../chatSocket');

const sendRequest = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId required' });
    const rel = await networkRepository.sendConnectionRequest(senderId, receiverId);

    try {
      const notification = await notificationRepository.createNotification(
        receiverId,
        'CONNECTION_REQUEST',
        'Ai đó muốn kết nối với bạn',
        senderId
      );
      if (notification) sendSocketNotification(receiverId, notification);
    } catch (notifErr) {
      console.error('Notification error (sendRequest):', notifErr);
    }

    res.status(200).json({ success: true, data: rel, message: 'Request sent' });
  } catch (err) {
    next(err);
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { senderId } = req.body;
    const rel = await networkRepository.acceptConnectionRequest(userId, senderId);

    try {
      const notification = await notificationRepository.createNotification(
        senderId,
        'CONNECTION_ACCEPTED',
        'Yêu cầu kết nối của bạn đã được chấp nhận',
        userId
      );
      if (notification) sendSocketNotification(senderId, notification);
    } catch (notifErr) {
      console.error('Notification error (acceptRequest):', notifErr);
    }

    res.status(200).json({ success: true, data: rel, message: 'Request accepted' });
  } catch (err) {
    next(err);
  }
};

const getMyConnections = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const friends = await networkRepository.getConnections(userId);
    res.status(200).json({ success: true, data: friends });
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const term = req.query.q || '';
    const users = await networkRepository.searchUsersToConnect(userId, term);
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { senderId } = req.body;
    await networkRepository.rejectConnectionRequest(userId, senderId);
    res.status(200).json({ success: true, message: 'Request rejected' });
  } catch (err) {
    next(err);
  }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const pending = await networkRepository.getPendingConnections(userId);
    res.status(200).json({ success: true, data: pending });
  } catch (err) {
    next(err);
  }
};

const removeConnection = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ success: false, message: 'friendId required' });
    await networkRepository.removeConnection(userId, friendId);
    res.status(200).json({ success: true, message: 'Connection removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
  getPendingRequests,
  getMyConnections,
  searchUsers
};
