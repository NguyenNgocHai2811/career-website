const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

// ===========================
// USER CORE
// ===========================

const getUsers = catchAsync(async (req, res) => {
  res.json(await userService.getUsers());
});

const createUser = catchAsync(async (req, res) => {
  res.status(201).json(await userService.registerUser(req.body));
});

const completeOnboarding = catchAsync(async (req, res) => {
  await userService.completeOnboarding(req.user.userId);
  res.status(200).json({ message: 'Onboarding completed successfully' });
});

// ===========================
// PROFILE
// ===========================

const getUserProfile = catchAsync(async (req, res) => {
  const targetId = req.params.userId === 'me' ? req.user?.userId : req.params.userId;
  if (!targetId) throw new Error('User ID is required');

  const profile = await userService.getUserProfile(targetId);
  const isOwner = req.user?.userId === targetId;

  // Check connection status if viewing another user's profile
  let connectionStatus = 'NONE'; // NONE | PENDING_SENT | PENDING_RECEIVED | CONNECTED
  if (!isOwner && req.user?.userId) {
    const networkRepository = require('../repositories/networkRepository');
    connectionStatus = await networkRepository.getConnectionStatus(req.user.userId, targetId);
  }

  res.status(200).json({ ...profile, isOwner, connectionStatus });
});

const getUserPosts = catchAsync(async (req, res) => {
  const targetId = req.params.userId === 'me' ? req.user?.userId : req.params.userId;
  if (!targetId) throw new Error('User ID is required');

  const posts = await userService.getUserPosts(targetId);
  res.status(200).json({ posts });
});

const getUserActivities = catchAsync(async (req, res) => {
  const targetId = req.params.userId === 'me' ? req.user?.userId : req.params.userId;
  if (!targetId) throw new Error('User ID is required');

  const activities = await userService.getUserActivities(targetId);
  res.status(200).json({ activities });
});

const updateBasicInfo = catchAsync(async (req, res) => {
  const result = await userService.updateBasicInfo(req.user.userId, req.body);
  res.status(200).json(result);
});

const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded'); // Sẽ chảy về Global Error Handler (500)
  const result = await userService.updateAvatar(req.user.userId, req.file.path);
  res.status(200).json(result);
});

const uploadBanner = catchAsync(async (req, res) => {
  if (!req.file) throw new Error('No file uploaded');
  const result = await userService.updateBanner(req.user.userId, req.file.path);
  res.status(200).json(result);
});

// ===========================
// EXPERIENCE
// ===========================

const addExperience = catchAsync(async (req, res) => {
  const exp = await userService.addExperience(req.user.userId, req.body);
  res.status(201).json(exp);
});

const updateExperience = catchAsync(async (req, res) => {
  const exp = await userService.updateExperience(req.user.userId, req.params.expId, req.body);
  res.status(200).json(exp);
});

const deleteExperience = catchAsync(async (req, res) => {
  const result = await userService.deleteExperience(req.user.userId, req.params.expId);
  res.status(200).json(result);
});

// ===========================
// EDUCATION
// ===========================

const addEducation = catchAsync(async (req, res) => {
  res.status(201).json(await userService.addEducation(req.user.userId, req.body));
});

const updateEducation = catchAsync(async (req, res) => {
  res.status(200).json(await userService.updateEducation(req.user.userId, req.params.eduId, req.body));
});

const deleteEducation = catchAsync(async (req, res) => {
  res.status(200).json(await userService.deleteEducation(req.user.userId, req.params.eduId));
});

// ===========================
// SKILLS
// ===========================

const addSkill = catchAsync(async (req, res) => {
  res.status(201).json(await userService.addSkill(req.user.userId, req.body.skillName));
});

const removeSkill = catchAsync(async (req, res) => {
  res.status(200).json(await userService.removeSkill(req.user.userId, decodeURIComponent(req.params.skillName)));
});

// ===========================
// PROJECTS
// ===========================

const addProject = catchAsync(async (req, res) => {
  res.status(201).json(await userService.addProject(req.user.userId, req.body));
});

const updateProject = catchAsync(async (req, res) => {
  res.status(200).json(await userService.updateProject(req.user.userId, req.params.projId, req.body));
});

const deleteProject = catchAsync(async (req, res) => {
  res.status(200).json(await userService.deleteProject(req.user.userId, req.params.projId));
});

// ===========================
// CERTIFICATIONS
// ===========================

const addCertification = catchAsync(async (req, res) => {
  res.status(201).json(await userService.addCertification(req.user.userId, req.body));
});

const updateCertification = catchAsync(async (req, res) => {
  res.status(200).json(await userService.updateCertification(req.user.userId, req.params.certId, req.body));
});

const deleteCertification = catchAsync(async (req, res) => {
  res.status(200).json(await userService.deleteCertification(req.user.userId, req.params.certId));
});

module.exports = {
  getUsers, createUser, completeOnboarding,
  getUserProfile, getUserPosts, getUserActivities, updateBasicInfo, uploadAvatar, uploadBanner,
  addExperience, updateExperience, deleteExperience,
  addEducation, updateEducation, deleteEducation,
  addSkill, removeSkill,
  addProject, updateProject, deleteProject,
  addCertification, updateCertification, deleteCertification,
};
