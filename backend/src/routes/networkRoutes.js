const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

router.post('/connect', networkController.sendRequest);
router.post('/accept', networkController.acceptRequest);
router.post('/reject', networkController.rejectRequest);
router.get('/pending', networkController.getPendingRequests);
router.get('/connections', networkController.getMyConnections);
router.get('/search', networkController.searchUsers);
router.delete('/disconnect', networkController.removeConnection);

module.exports = router;
