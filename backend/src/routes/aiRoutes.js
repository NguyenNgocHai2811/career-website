const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

// POST /v1/ai/career-predict — Main conversational endpoint
router.post('/career-predict', aiController.careerPredict);

// POST /v1/ai/export-context — Build copy-to-clipboard context string
router.post('/export-context', aiController.exportContext);

module.exports = router;
