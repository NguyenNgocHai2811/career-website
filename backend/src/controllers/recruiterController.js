const recruiterRepository = require('../repositories/recruiterRepository');
const notificationRepository = require('../repositories/notificationRepository');
const { sendSocketNotification } = require('../chatSocket');
const { cloudinary } = require('../config/cloudinary');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const metrics = await recruiterRepository.getDashboardMetrics(userId);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

const getMyCompanies = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const companies = await recruiterRepository.getMyCompanies(userId);
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    next(error);
  }
};

const postJob = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { companyId, title, description, employmentType, location, salaryMin, salaryMax } = req.body;

    if (!companyId || !title) {
      return res.status(400).json({ success: false, message: 'companyId and title are required' });
    }

    const newJob = await recruiterRepository.postJob(userId, req.body);
    
    if (!newJob) {
      return res.status(400).json({ success: false, message: 'Failed to post job. Please ensure you have recruiter access for this company.' });
    }

    res.status(201).json({ success: true, data: newJob, message: 'Job posted successfully' });
  } catch (error) {
    next(error);
  }
};

const getApplicants = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.query; // optional filter by job
    const applicants = await recruiterRepository.getApplicants(userId, jobId || null);
    res.status(200).json({ success: true, data: applicants });
  } catch (error) {
    next(error);
  }
};

const getMyJobs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const jobs = await recruiterRepository.getMyJobs(userId);
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const recruiterId = req.user.userId;
    const { applicantId, jobId, status } = req.body;

    const validStatuses = ['PENDING', 'SHORTLISTED', 'INTERVIEWED', 'REJECTED', 'HIRED'];
    if (!applicantId || !jobId || !status) {
      return res.status(400).json({ success: false, message: 'applicantId, jobId, and status are required' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await recruiterRepository.updateApplicationStatus(recruiterId, applicantId, jobId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    try {
      const notification = await notificationRepository.createNotification(
        applicantId,
        'APPLICATION_STATUS_CHANGE',
        `Đơn ứng tuyển của bạn đã được cập nhật: ${status}`,
        jobId
      );
      if (notification) sendSocketNotification(applicantId, notification);
    } catch (notifErr) {
      console.error('Notification error (updateApplicationStatus):', notifErr);
    }

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (error) {
    next(error);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const company = await recruiterRepository.createCompany(userId, req.body);
    if (!company) {
      return res.status(400).json({ success: false, message: 'Failed to create company' });
    }
    res.status(201).json({ success: true, data: company, message: 'Company created successfully' });
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { companyId } = req.params;
    const company = await recruiterRepository.updateCompany(userId, companyId, req.body);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found or unauthorized' });
    }
    res.status(200).json({ success: true, data: company, message: 'Company updated successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const userId = req.user.userId;
    const { companyId } = req.params;
    const logoUrl = req.file.path;
    
    const company = await recruiterRepository.updateCompany(userId, companyId, { logoUrl });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found or unauthorized' });
    }
    
    res.status(200).json({ success: true, data: { logoUrl }, message: 'Logo uploaded successfully' });
  } catch (error) {
    next(error);
  }
};

const getApplicantResumeDownloadUrl = async (req, res, next) => {
  try {
    const recruiterId = req.user.userId;
    const { applicantId, jobId } = req.params;

    const application = await recruiterRepository.getApplicantResume(recruiterId, applicantId, jobId);
    if (!application || !application.cvUrl) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    if ((application.cvType || '').toLowerCase() !== 'file') {
      return res.status(400).json({ success: false, message: 'This applicant used profile CV, not uploaded file' });
    }

    let parsed;
    try {
      parsed = new URL(application.cvUrl);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid resume URL' });
    }

    const pathPart = parsed.pathname || '';
    const marker = '/upload/';
    const idx = pathPart.indexOf(marker);
    if (idx === -1) {
      return res.status(400).json({ success: false, message: 'Unsupported Cloudinary URL format' });
    }

    let publicIdWithExt = pathPart.slice(idx + marker.length);
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');
    publicIdWithExt = decodeURIComponent(publicIdWithExt).replace(/^\/+/, '');

    if (!publicIdWithExt.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ success: false, message: 'Resume is not a PDF file' });
    }

    const publicIdWithoutExt = publicIdWithExt.slice(0, -4); // strip ".pdf"
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
    const options = {
      resource_type: 'raw',
      type: 'upload',
      attachment: true,
      expires_at: expiresAt,
    };

    // Cloudinary raw assets can be stored with extension inside public_id,
    // depending on upload config/history. Try both variants.
    const candidates = [
      cloudinary.utils.private_download_url(publicIdWithExt, 'pdf', options),
      cloudinary.utils.private_download_url(publicIdWithoutExt, 'pdf', options),
    ];

    const isReachable = async (url) => {
      try {
        const r = await fetch(url, { method: 'HEAD' });
        return r.ok;
      } catch (e) {
        return false;
      }
    };

    for (const url of candidates) {
      // eslint-disable-next-line no-await-in-loop
      if (await isReachable(url)) {
        return res.status(200).json({ success: true, data: { url } });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Resume resource is unavailable on Cloudinary',
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;
    const updated = await recruiterRepository.updateJob(userId, jobId, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.status(200).json({ success: true, data: updated, message: 'Job updated successfully' });
  } catch (error) {
    next(error);
  }
};

const setJobStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;
    const { status } = req.body;
    const validStatuses = ['ACTIVE', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be ACTIVE or CLOSED' });
    }
    const updated = await recruiterRepository.setJobStatus(userId, jobId, status);
    if (!updated) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.status(200).json({ success: true, data: updated, message: `Job ${status.toLowerCase()}` });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;
    const deleted = await recruiterRepository.deleteJob(userId, jobId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getMyCompanies,
  postJob,
  getApplicants,
  getMyJobs,
  updateApplicationStatus,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
  getApplicantResumeDownloadUrl,
  updateJob,
  setJobStatus,
  deleteJob,
};
