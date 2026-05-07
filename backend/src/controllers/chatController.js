const chatRepository = require('../repositories/chatRepository');

const getRecentChats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const chats = await chatRepository.getRecentChats(userId);
    res.status(200).json({ success: true, data: chats });
  } catch(err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const friendId = req.params.friendId;
    const history = await chatRepository.getChatHistory(userId, friendId);
    res.status(200).json({ success: true, data: history });
  } catch(err) {
    next(err);
  }
};

module.exports = {
  getRecentChats,
  getHistory
};
