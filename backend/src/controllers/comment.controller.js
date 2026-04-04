const commentService = require('../services/comment.service');

const replyToComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params; // commentId
    const { content } = req.body;

    const newReply = await commentService.replyToComment(userId, id, content);
    res.status(201).json({ message: 'Reply added', comment: newReply });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const getReplies = async (req, res) => {
  try {
    const { id } = req.params; // parent commentId
    const { cursor, limit } = req.query;

    const replies = await commentService.getReplies(id, cursor, limit);
    res.status(200).json({ replies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content } = req.body;

    const updatedComment = await commentService.updateComment(userId, id, content);
    res.status(200).json({ message: 'Comment updated', comment: updatedComment });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('authorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deletedComment = await commentService.deleteComment(userId, id);
    res.status(200).json({ message: 'Comment deleted', comment: deletedComment });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('authorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { type } = req.body;

    await commentService.addReaction(userId, id, type);
    res.status(200).json({ message: 'Reaction added' });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const removeReaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await commentService.removeReaction(userId, id);
    res.status(200).json({ message: 'Reaction removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  replyToComment,
  getReplies,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction
};
