const jobRepository = require('../repositories/jobRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { sendSocketNotification } = require('../chatSocket');

const getJobs = async (req, res, next) => {
  try {
    const filters = req.query;
    const jobs = await jobRepository.getAllJobs(filters);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

const getRecommendedJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'CANDIDATE') {
      return res.status(403).json({ success: false, message: 'Recommendations are only available for candidates' });
    }

    const userId = req.user.userId;
    const result = await jobRepository.getRecommendedJobsForCandidate(userId, req.query);
    res.status(200).json({ success: true, data: result.jobs, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobRepository.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    let hasApplied = false;
    let isSaved = false;
    if (req.user?.userId) {
      [hasApplied, isSaved] = await Promise.all([
        jobRepository.hasApplied(req.user.userId, id),
        jobRepository.isSaved(req.user.userId, id),
      ]);
    }

    res.status(200).json({ success: true, data: { ...job, hasApplied, isSaved } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/jobs/:id/apply
 * Body (multipart/form-data):
 *   cvType: 'profile' | 'file'
 *   coverLetter: string (optional)
 *   cv: File (only when cvType === 'file')
 */
const applyToJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const userId = req.user.userId;
    const { cvType, coverLetter } = req.body;

    // Validate cvType
    if (!cvType || !['profile', 'file'].includes(cvType)) {
      return res.status(400).json({ success: false, message: 'cvType must be "profile" or "file"' });
    }

    // If file upload, get the Cloudinary URL from multer
    let cvUrl = '';
    if (cvType === 'file') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'CV file is required when cvType is "file"' });
      }
      cvUrl = req.file.secure_url || req.file.path; // Prefer https URL from Cloudinary
    }

    const result = await jobRepository.applyToJob(userId, jobId, {
      cvType,
      cvUrl,
      coverLetter: coverLetter || '',
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'User or Job not found' });
    }

    if (result.alreadyApplied) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job' });
    }

    if (result.recruiterId) {
      try {
        const notification = await notificationRepository.createNotification(
          result.recruiterId,
          'JOB_APPLICATION',
          `Có ứng viên mới đã nộp đơn vào vị trí "${result.jobTitle}"`,
          jobId
        );
        if (notification) sendSocketNotification(result.recruiterId, notification);
      } catch (notifErr) {
        console.error('Notification error (applyToJob):', notifErr);
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully applied to "${result.jobTitle}"`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const saveJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const userId = req.user.userId;
    await jobRepository.saveJob(userId, jobId);
    res.status(200).json({ success: true, message: 'Job saved' });
  } catch (error) {
    next(error);
  }
};

const unsaveJob = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const userId = req.user.userId;
    await jobRepository.unsaveJob(userId, jobId);
    res.status(200).json({ success: true, message: 'Job unsaved' });
  } catch (error) {
    next(error);
  }
};

const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const jobs = await jobRepository.getSavedJobs(userId);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getRecommendedJobs,
  getJobById,
  applyToJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
};
