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

// Update a job
router.put('/jobs/:jobId', recruiterController.updateJob);

// Set job status (ACTIVE | CLOSED)
router.patch('/jobs/:jobId/status', recruiterController.setJobStatus);

// Delete a job
router.delete('/jobs/:jobId', recruiterController.deleteJob);

// Get jobs posted by this recruiter (with applicant count)
router.get('/my-jobs', recruiterController.getMyJobs);

// Get list of applicants (optional ?jobId=xxx filter)
router.get('/applicants', recruiterController.getApplicants);
router.get('/applications/:jobId/:applicantId/resume', recruiterController.getApplicantResumeDownloadUrl);

// Update application status (PENDING | SHORTLISTED | INTERVIEWED | REJECTED | HIRED)
router.patch('/applications/status', recruiterController.updateApplicationStatus);

module.exports = router;

