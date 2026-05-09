const postService = require('../services/post.service');

const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content, privacy } = req.body;

    // multer-storage-cloudinary puts the result in req.file
    let mediaUrl = null;
    let mediaType = null;
    if (req.file) {
      mediaUrl = req.file.path; // Cloudinary secure URL
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const newPost = await postService.createPost(userId, { content, mediaUrl, mediaType, privacy });
    if (!newPost) {
      return res.status(400).json({ error: 'Failed to create post' });
    }

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const currentUserId = req.user ? req.user.userId : null;
    const posts = await postService.getPosts(currentUserId, cursor, limit);
    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    res.status(200).json({ post });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const addReaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { type } = req.body;

    await postService.addReaction(userId, id, type);
    res.status(200).json({ message: 'Reaction added' });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const removeReaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await postService.removeReaction(userId, id);
    res.status(200).json({ message: 'Reaction removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content } = req.body;

    const newComment = await postService.addComment(userId, id, content);
    res.status(201).json({ message: 'Comment added', comment: newComment });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;

    const comments = await postService.getComments(id, page, limit);
    res.status(200).json({ comments });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { content, privacy } = req.body;
    const updated = await postService.updatePost(userId, id, { content, privacy });
    res.status(200).json({ message: 'Post updated', post: updated });
  } catch (error) {
    const status = error.message.includes('không tồn tại') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    await postService.deletePost(userId, id);
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    const status = error.message.includes('không tồn tại') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
};

const reportPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Vui lòng chọn lý do báo cáo' });
    const result = await postService.reportPost(userId, id, reason);
    res.status(201).json({ message: 'Báo cáo đã được ghi nhận', data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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
