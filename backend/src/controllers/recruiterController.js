const recruiterRepository = require('../repositories/recruiterRepository');

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
};
