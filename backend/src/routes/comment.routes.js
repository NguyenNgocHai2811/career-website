const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Add a reply to a comment
router.post('/:id/reply', authMiddleware.verifyToken, commentController.replyToComment);

// Get replies of a comment
router.get('/:id/replies', authMiddleware.verifyToken, commentController.getReplies);

// Update a comment
router.put('/:id', authMiddleware.verifyToken, commentController.updateComment);

// Reactions
router.post('/:id/reactions', authMiddleware.verifyToken, commentController.addReaction);
router.delete('/:id/reactions', authMiddleware.verifyToken, commentController.removeReaction);

// Delete a comment (soft delete)
router.delete('/:id', authMiddleware.verifyToken, commentController.deleteComment);

module.exports = router;
