const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middlewares/authMiddleware');
const { uploadCV } = require('../config/cloudinary');

// GET /v1/jobs - Fetch list of jobs (public)
router.get('/', jobController.getJobs);

// GET /v1/jobs/saved - Get saved jobs for logged-in user (must be before /:id)
router.get('/saved', authMiddleware.verifyToken, jobController.getSavedJobs);

// GET /v1/jobs/recommended - Get recommended jobs for logged-in candidate (must be before /:id)
router.get('/recommended', authMiddleware.verifyToken, jobController.getRecommendedJobs);

// GET /v1/jobs/applications - List candidate's applications (must be before /:id)
router.get('/applications', authMiddleware.verifyToken, jobController.getMyApplications);
// POST /v1/jobs/applications/external - Create manually tracked external application
router.post('/applications/external', authMiddleware.verifyToken, jobController.createExternalApplication);
// PATCH /v1/jobs/applications/:jobId - Update candidate-owned fields
router.patch('/applications/:jobId', authMiddleware.verifyToken, jobController.updateMyApplication);
// PATCH /v1/jobs/applications/:jobId/archive - Archive or restore an application
router.patch('/applications/:jobId/archive', authMiddleware.verifyToken, jobController.archiveMyApplication);

// GET /v1/jobs/:id - Fetch single job by ID (optional auth to check hasApplied, isSaved)
router.get('/:id', authMiddleware.verifyTokenOptional, jobController.getJobById);

// POST /v1/jobs/:id/apply - Apply to a job (requires auth)
router.post('/:id/apply', authMiddleware.verifyToken, uploadCV.single('cv'), jobController.applyToJob);

// POST /v1/jobs/:id/save - Save a job
router.post('/:id/save', authMiddleware.verifyToken, jobController.saveJob);

// DELETE /v1/jobs/:id/save - Unsave a job
router.delete('/:id/save', authMiddleware.verifyToken, jobController.unsaveJob);

module.exports = router;
