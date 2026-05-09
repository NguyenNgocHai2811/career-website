const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, verifyTokenOptional } = require('../middlewares/authMiddleware');

// Optional auth so isFollowing is populated when logged in
router.get('/:id', verifyTokenOptional, companyController.getCompanyDetails);

router.get('/:id/posts', verifyTokenOptional, companyController.getCompanyPosts);
router.post('/:id/follow', verifyToken, companyController.followCompany);
router.delete('/:id/follow', verifyToken, companyController.unfollowCompany);

module.exports = router;
