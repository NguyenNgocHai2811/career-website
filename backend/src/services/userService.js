const userRepository = require('../repositories/userRepository');
const postRepository = require('../repositories/post.repository');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const getUsers = async () => userRepository.getAllUsers();

const registerUser = async (data) => {
  if (!data.email || !data.name) throw new BadRequestError('Email and Name are required');
  return await userRepository.createUser(data);
};

const completeOnboarding = async (userId) => userRepository.completeOnboarding(userId);

// ===========================
// PROFILE
// ===========================

const getUserProfile = async (userId) => {
  const profile = await userRepository.getUserProfile(userId);
  if (!profile) throw new NotFoundError('User profile not found');
  return profile;
};

const getUserPosts = async (userId, currentUserId) => {
  return await postRepository.getUserPosts(userId, currentUserId);
};

const getUserActivities = async (userId) => {
  return await userRepository.getUserActivities(userId);
};

const updateBasicInfo = async (userId, data) => {
  const result = await userRepository.updateBasicInfo(userId, data);
  if (!result) throw new NotFoundError('User not found to update');
  return result;
};

const updateAvatar = async (userId, avatarUrl) => {
  const url = await userRepository.updateAvatar(userId, avatarUrl);
  if (!url) throw new NotFoundError('User not found to update avatar');
  return { avatarUrl: url };
};

const updateBanner = async (userId, bannerUrl) => {
  const url = await userRepository.updateBanner(userId, bannerUrl);
  if (!url) throw new NotFoundError('User not found to update banner');
  return { bannerUrl: url };
};

// ===========================
// EXPERIENCE
// ===========================

const addExperience = async (userId, data) => {
  if (!data.title || !data.company) throw new BadRequestError('Title and Company are required');
  return await userRepository.addExperience(userId, data);
};

const updateExperience = async (userId, expId, data) => {
  const result = await userRepository.updateExperience(userId, expId, data);
  if (!result) throw new NotFoundError('Experience not found');
  return result;
};

const deleteExperience = async (userId, expId) => {
  const deleted = await userRepository.deleteExperience(userId, expId);
  if (!deleted) throw new NotFoundError('Experience not found to delete');
  return { message: 'Deleted successfully' };
};

// ===========================
// EDUCATION
// ===========================

const addEducation = async (userId, data) => {
  if (!data.schoolName) throw new BadRequestError('School name is required');
  return await userRepository.addEducation(userId, data);
};

const updateEducation = async (userId, eduId, data) => {
  const result = await userRepository.updateEducation(userId, eduId, data);
  if (!result) throw new NotFoundError('Education not found');
  return result;
};

const deleteEducation = async (userId, eduId) => {
  const deleted = await userRepository.deleteEducation(userId, eduId);
  if (!deleted) throw new NotFoundError('Education not found to delete');
  return { message: 'Deleted successfully' };
};

// ===========================
// SKILLS
// ===========================

const addSkill = async (userId, skillName) => {
  if (!skillName) throw new BadRequestError('Skill name is required');
  return await userRepository.addSkill(userId, skillName);
};

const removeSkill = async (userId, skillName) => {
  const deleted = await userRepository.removeSkill(userId, skillName);
  if (!deleted) throw new NotFoundError('Skill not found to remove');
  return { message: 'Skill removed successfully' };
};

// ===========================
// PROJECTS
// ===========================

const addProject = async (userId, data) => {
  if (!data.name) throw new BadRequestError('Project name is required');
  return await userRepository.addProject(userId, data);
};

const updateProject = async (userId, projId, data) => {
  const result = await userRepository.updateProject(userId, projId, data);
  if (!result) throw new NotFoundError('Project not found');
  return result;
};

const deleteProject = async (userId, projId) => {
  const deleted = await userRepository.deleteProject(userId, projId);
  if (!deleted) throw new NotFoundError('Project not found to delete');
  return { message: 'Deleted successfully' };
};

// ===========================
// CERTIFICATIONS
// ===========================

const addCertification = async (userId, data) => {
  if (!data.name || !data.organization) throw new BadRequestError('Name and organization are required');
  return await userRepository.addCertification(userId, data);
};

const updateCertification = async (userId, certId, data) => {
  const result = await userRepository.updateCertification(userId, certId, data);
  if (!result) throw new NotFoundError('Certification not found');
  return result;
};

const deleteCertification = async (userId, certId) => {
  const deleted = await userRepository.deleteCertification(userId, certId);
  if (!deleted) throw new NotFoundError('Certification not found to delete');
  return { message: 'Deleted successfully' };
};

module.exports = {
  getUsers, registerUser, completeOnboarding,
  getUserProfile, updateBasicInfo, updateAvatar, updateBanner,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addSkill, removeSkill,
  addProject, updateProject, deleteProject,
  addCertification, updateCertification, deleteCertification,
  getUserPosts, getUserActivities,
};
