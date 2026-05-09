const commentRepository = require('../repositories/comment.repository');

const replyToComment = async (userId, commentId, content) => {
  if (!content) throw new Error('Reply content is required');
  return await commentRepository.replyToComment(userId, commentId, content);
};

const getReplies = async (userId, commentId, cursor, limit) => {
  return await commentRepository.getReplies(userId, commentId, cursor, limit);
};

const updateComment = async (userId, commentId, content) => {
  if (!content) throw new Error('Comment content is required');
  return await commentRepository.updateComment(userId, commentId, content);
};

const deleteComment = async (userId, commentId) => {
  return await commentRepository.deleteComment(userId, commentId);
};

const addReaction = async (userId, commentId, type) => {
  if (!['Like', 'Celebrate', 'Insightful', 'Love'].includes(type)) {
    throw new Error('Invalid reaction type');
  }
  return await commentRepository.addReaction(userId, commentId, type);
};

const removeReaction = async (userId, commentId) => {
  return await commentRepository.removeReaction(userId, commentId);
};

module.exports = {
  replyToComment,
  getReplies,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction
};
