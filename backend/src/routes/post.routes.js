const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all posts (News Feed) - typically auth but allow public based on requirements? User feed is usually authenticated
router.get('/', authMiddleware, postController.getPosts);

// Create a new post
router.post('/', authMiddleware, postController.createPost);

// Get post details
router.get('/:id', postController.getPostById); // Public

// Add a reaction to a post
router.post('/:id/reactions', authMiddleware, postController.addReaction);

// Remove a reaction from a post
router.delete('/:id/reactions', authMiddleware, postController.removeReaction);

// Add a comment to a post
router.post('/:id/comments', authMiddleware, postController.addComment);

// Get comments for a post
router.get('/:id/comments', postController.getComments); // Public

module.exports = router;
