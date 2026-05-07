const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadCV } = require('../config/cloudinary');

// GET /v1/jobs - Fetch list of jobs (public)
router.get('/', jobController.getJobs);

// GET /v1/jobs/:id - Fetch single job by ID (optional auth to check hasApplied)
router.get('/:id', authMiddleware.verifyTokenOptional, jobController.getJobById);

// POST /v1/jobs/:id/apply - Apply to a job (requires auth)
// uploadCV.single('cv') handles the optional file upload field named 'cv'
router.post('/:id/apply', authMiddleware.verifyToken, uploadCV.single('cv'), jobController.applyToJob);

module.exports = router;
