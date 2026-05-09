const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/stats', verifyAdmin, adminController.getStats);
router.get('/users', verifyAdmin, adminController.getUsers);
router.patch('/users/:userId/ban', verifyAdmin, adminController.banUser);
router.delete('/users/:userId', verifyAdmin, adminController.deleteUser);
router.get('/jobs', verifyAdmin, adminController.getJobs);
router.delete('/jobs/:jobId', verifyAdmin, adminController.deleteJob);
router.get('/posts', verifyAdmin, adminController.getPosts);
router.delete('/posts/:postId', verifyAdmin, adminController.deletePost);

// Report queue
router.get('/reports', verifyAdmin, adminController.getReports);
router.patch('/reports/:reportId/resolve', verifyAdmin, adminController.resolveReport);

module.exports = router;
