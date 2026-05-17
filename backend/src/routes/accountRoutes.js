const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/email/verify', accountController.verifyEmail);

router.use(authMiddleware.verifyToken);

router.get('/', accountController.getAccount);
router.patch('/', accountController.updateAccount);
router.patch('/email', accountController.updateEmail);
router.post('/email/verification', accountController.requestEmailVerification);
router.patch('/password', accountController.changePassword);
router.patch('/notifications', accountController.updateNotificationPreferences);
router.delete('/', accountController.deactivateAccount);

module.exports = router;
