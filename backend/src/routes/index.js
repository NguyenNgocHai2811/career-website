const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');

// Mount routes
router.use('/users', userRoutes);

module.exports = router;
