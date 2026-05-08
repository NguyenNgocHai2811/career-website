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

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await jobRepository.getJobById(id);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // If user is logged in, check if they already applied
    let hasApplied = false;
    if (req.user?.userId) {
      hasApplied = await jobRepository.hasApplied(req.user.userId, id);
    }
    
    res.status(200).json({ success: true, data: { ...job, hasApplied } });
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
      cvUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary
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

module.exports = {
  getJobs,
  getJobById,
  applyToJob,
};
