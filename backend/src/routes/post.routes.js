const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// Get all posts (News Feed) - typically auth but allow public based on requirements? User feed is usually authenticated
router.get('/', authMiddleware.verifyToken, postController.getPosts);

// Create a new post (supports optional image or video)
router.post('/', authMiddleware.verifyToken, upload.single('media'), postController.createPost);

// Get post details
router.get('/:id', postController.getPostById); // Public

// Edit a post (author only)
router.put('/:id', authMiddleware.verifyToken, postController.updatePost);

// Delete a post (author only)
router.delete('/:id', authMiddleware.verifyToken, postController.deletePost);

// Report a post
router.post('/:id/report', authMiddleware.verifyToken, postController.reportPost);

// Add a reaction to a post
router.post('/:id/reactions', authMiddleware.verifyToken, postController.addReaction);

// Remove a reaction from a post
router.delete('/:id/reactions', authMiddleware.verifyToken, postController.removeReaction);

// Add a comment to a post
router.post('/:id/comments', authMiddleware.verifyToken, postController.addComment);

// Get comments for a post
router.get('/:id/comments', authMiddleware.verifyToken, postController.getComments); // Public

module.exports = router;
