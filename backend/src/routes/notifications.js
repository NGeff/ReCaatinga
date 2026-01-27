const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  registerDevice,
  sendToAll,
  sendToUser,
  getHistory,
  removeDevice
} = require('../controllers/notificationController');

router.post('/register-device', protect, registerDevice);
router.post('/send-all', protect, admin, sendToAll);
router.post('/send-user/:userId', protect, admin, sendToUser);
router.get('/history', protect, admin, getHistory);
router.delete('/remove-device', protect, removeDevice);

module.exports = router;
