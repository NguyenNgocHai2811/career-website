const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/:id', companyController.getCompanyDetails);

module.exports = router;
