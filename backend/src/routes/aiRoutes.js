const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

// Career Explorer (V2) — 5 phase endpoints
router.post('/career-tasks', aiController.generateTasks);
router.post('/career-skills', aiController.generateSkills);
router.post('/career-identity', aiController.generateIdentity);
router.post('/career-paths', aiController.generateCareerPaths);
router.post('/career-detail', aiController.generateCareerDetail);

module.exports = router;
