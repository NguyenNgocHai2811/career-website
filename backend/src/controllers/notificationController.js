const notificationRepository = require('../repositories/notificationRepository');

const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    
    const notifications = await notificationRepository.getNotifications(userId, limit, skip);
    const unreadCount = await notificationRepository.getUnreadCount(userId);
    
    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'Missing notification ids' });
    }
    
    const updatedCount = await notificationRepository.markAsRead(ids);
    res.json({ success: true, data: { updatedCount } });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await notificationRepository.markAllAsRead(userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
