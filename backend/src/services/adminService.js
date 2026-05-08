const adminRepository = require('../repositories/adminRepository');

const getStats = async () => adminRepository.getStats();

const getUsers = async (params) => adminRepository.getUsers(params);

const banUser = async (userId, isBanned) => adminRepository.banUser(userId, isBanned);

const deleteUser = async (userId) => adminRepository.deleteUser(userId);

const getJobs = async (params) => adminRepository.getJobs(params);

const deleteJob = async (jobId) => adminRepository.deleteJob(jobId);

const getPosts = async (params) => adminRepository.getPosts(params);

const deletePost = async (postId) => adminRepository.deletePost(postId);

module.exports = { getStats, getUsers, banUser, deleteUser, getJobs, deleteJob, getPosts, deletePost };
