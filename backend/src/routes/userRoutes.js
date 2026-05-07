const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload, uploadProfileImage } = require('../config/cloudinary');

// ===========================
// USER CORE
// ===========================
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.post('/complete-onboarding', authMiddleware.verifyToken, userController.completeOnboarding);

// ===========================
// PROFILE — VIEW & FEEDS (public, but token optional for isOwner flag)
// ===========================
router.get('/:userId/profile', authMiddleware.verifyTokenOptional, userController.getUserProfile);
router.get('/:userId/posts', authMiddleware.verifyTokenOptional, userController.getUserPosts);
router.get('/:userId/activities', authMiddleware.verifyTokenOptional, userController.getUserActivities);

// ===========================
// PROFILE — EDIT (all require auth)
// ===========================
router.put('/profile/basic-info', authMiddleware.verifyToken, userController.updateBasicInfo);
router.post('/profile/avatar', authMiddleware.verifyToken, uploadProfileImage.single('avatar'), userController.uploadAvatar);
router.post('/profile/banner', authMiddleware.verifyToken, uploadProfileImage.single('banner'), userController.uploadBanner);

// Experience
router.post('/profile/experience', authMiddleware.verifyToken, userController.addExperience);
router.put('/profile/experience/:expId', authMiddleware.verifyToken, userController.updateExperience);
router.delete('/profile/experience/:expId', authMiddleware.verifyToken, userController.deleteExperience);

// Education
router.post('/profile/education', authMiddleware.verifyToken, userController.addEducation);
router.put('/profile/education/:eduId', authMiddleware.verifyToken, userController.updateEducation);
router.delete('/profile/education/:eduId', authMiddleware.verifyToken, userController.deleteEducation);

// Skills
router.post('/profile/skills', authMiddleware.verifyToken, userController.addSkill);
router.delete('/profile/skills/:skillName', authMiddleware.verifyToken, userController.removeSkill);

// Projects
router.post('/profile/projects', authMiddleware.verifyToken, userController.addProject);
router.put('/profile/projects/:projId', authMiddleware.verifyToken, userController.updateProject);
router.delete('/profile/projects/:projId', authMiddleware.verifyToken, userController.deleteProject);

// Certifications
router.post('/profile/certifications', authMiddleware.verifyToken, userController.addCertification);
router.put('/profile/certifications/:certId', authMiddleware.verifyToken, userController.updateCertification);
router.delete('/profile/certifications/:certId', authMiddleware.verifyToken, userController.deleteCertification);

module.exports = router;
