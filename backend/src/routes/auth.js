const express = require('express');
const router = express.Router();
const { register, verifyEmail, resendCode, login, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;