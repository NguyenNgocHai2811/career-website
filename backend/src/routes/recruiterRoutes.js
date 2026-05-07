const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiterController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

// All recruiter routes require authentication
router.use(authMiddleware.verifyToken);

// Dashboard Overview Metrics
router.get('/dashboard', recruiterController.getDashboardMetrics);

// Get companies the user is recruiter for
router.get('/companies', recruiterController.getMyCompanies);

// Create a company for the recruiter
router.post('/companies', recruiterController.createCompany);

// Update company info
router.put('/companies/:companyId', recruiterController.updateCompany);

// Upload company logo
router.post('/companies/:companyId/logo', upload.single('logo'), recruiterController.uploadCompanyLogo);

// Post a new job
router.post('/jobs', recruiterController.postJob);

// Get jobs posted by this recruiter (with applicant count)
router.get('/my-jobs', recruiterController.getMyJobs);

// Get list of applicants (optional ?jobId=xxx filter)
router.get('/applicants', recruiterController.getApplicants);

// Update application status (PENDING | SHORTLISTED | INTERVIEWED | REJECTED | HIRED)
router.patch('/applications/status', recruiterController.updateApplicationStatus);

module.exports = router;

