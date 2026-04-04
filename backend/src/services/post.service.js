const postRepository = require('../repositories/post.repository');

const createPost = async (userId, postData) => {
  if (!postData.content && (!postData.mediaUrls || postData.mediaUrls.length === 0)) {
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

const addReaction = async (userId, postId, type = 'LIKE') => {
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  addReaction,
  removeReaction,
  addComment,
  getComments
};
