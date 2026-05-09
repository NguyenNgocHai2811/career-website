const companyRepository = require('../repositories/companyRepository');

const getCompanyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId || null;
    const company = await companyRepository.getCompanyById(id, currentUserId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    const [jobs, employees] = await Promise.all([
      companyRepository.getCompanyJobs(id),
      companyRepository.getCompanyEmployees(id),
    ]);
    res.status(200).json({ success: true, data: { ...company, jobs, employees } });
  } catch (err) {
    next(err);
  }
};

const followCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id: companyId } = req.params;
    await companyRepository.followCompany(userId, companyId);
    res.status(200).json({ success: true, message: 'Followed' });
  } catch (err) {
    next(err);
  }
};

const unfollowCompany = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id: companyId } = req.params;
    await companyRepository.unfollowCompany(userId, companyId);
    res.status(200).json({ success: true, message: 'Unfollowed' });
  } catch (err) {
    next(err);
  }
};

const getCompanyPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId || null;
    const posts = await companyRepository.getCompanyPosts(id, currentUserId);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCompanyDetails,
  getCompanyPosts,
  followCompany,
  unfollowCompany,
};
