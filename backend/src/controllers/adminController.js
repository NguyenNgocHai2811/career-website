const adminService = require('../services/adminService');

const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await adminService.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.status(200).json({
      success: true,
      data: result.users,
      meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isBanned } = req.body;
    if (typeof isBanned !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isBanned must be a boolean' });
    }
    await adminService.banUser(userId, isBanned);
    res.status(200).json({ success: true, message: isBanned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(userId);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const result = await adminService.getJobs({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.status(200).json({
      success: true,
      data: result.jobs,
      meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    await adminService.deleteJob(jobId);
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await adminService.getPosts({
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.status(200).json({
      success: true,
      data: result.posts,
      meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    await adminService.deletePost(postId);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    const result = await adminService.getReports({ page: parseInt(page), limit: parseInt(limit), status });
    res.status(200).json({
      success: true,
      data: result.reports,
      meta: { total: result.total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

const resolveReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body;
    if (!['DISMISS', 'DELETE_CONTENT'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be DISMISS or DELETE_CONTENT' });
    }
    const ok = await adminService.resolveReport(reportId, action);
    if (!ok) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, message: action === 'DELETE_CONTENT' ? 'Nội dung đã bị xóa' : 'Báo cáo đã bị bỏ qua' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost, getReports, resolveReport };
