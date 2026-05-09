const postRepository = require('../repositories/post.repository');

const createPost = async (userId, postData) => {
  if (!postData.content && !postData.mediaUrl) {
    throw new Error('Post must have content or media');
  }
  return await postRepository.createPost(userId, postData);
};

const getPosts = async (currentUserId, cursor, limit) => {
  return await postRepository.getPosts(currentUserId, cursor, limit);
};

const getPostById = async (postId) => {
  const post = await postRepository.getPostById(postId);
  if (!post) throw new Error('Post not found');
  return post;
};

const addReaction = async (userId, postId, type = 'Like') => {
  if (!['Like', 'Celebrate', 'Insightful', 'Love'].includes(type)) {
    throw new Error('Invalid reaction type');
  }
  // Ensure post exists
  await getPostById(postId);
  return await postRepository.addReaction(userId, postId, type);
};

const removeReaction = async (userId, postId) => {
  return await postRepository.removeReaction(userId, postId);
};

const addComment = async (userId, postId, content) => {
  if (!content) throw new Error('Comment content is required');
  // Ensure post exists
  await getPostById(postId);
  return await postRepository.addComment(userId, postId, content);
};

const getComments = async (postId, page, limit) => {
  // Ensure post exists
  await getPostById(postId);
  return await postRepository.getComments(postId, page, limit);
};

const updatePost = async (userId, postId, { content, privacy }) => {
  if (!content?.trim()) throw new Error('Nội dung bài viết không được để trống');
  const updated = await postRepository.updatePost(userId, postId, { content: content.trim(), privacy: privacy || 'Public' });
  if (!updated) throw new Error('Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa');
  return updated;
};

const deletePost = async (userId, postId) => {
  const deleted = await postRepository.deletePost(userId, postId);
  if (!deleted) throw new Error('Bài viết không tồn tại hoặc bạn không có quyền xóa');
  return true;
};

const VALID_REASONS = ['Spam', 'Thông tin sai lệch', 'Ngôn từ thù địch', 'Nội dung không phù hợp', 'Quấy rối', 'Khác'];

const reportPost = async (userId, postId, reason) => {
  if (!VALID_REASONS.includes(reason)) throw new Error('Lý do không hợp lệ');
  const result = await postRepository.reportPost(userId, postId, reason);
  if (!result) throw new Error('Bài viết không tồn tại');
  return result;
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  addReaction,
  removeReaction,
  addComment,
  getComments,
  updatePost,
  deletePost,
  reportPost,
};
