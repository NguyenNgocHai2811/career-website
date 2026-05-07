const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/:id', verifyToken, companyController.getCompanyDetails);

module.exports = router;
