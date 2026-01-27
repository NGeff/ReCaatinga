const express = require('express');
const router = express.Router();
const { getTopUsers, getUserRank } = require('../controllers/rankingController');
const { protect, verified } = require('../middleware/auth');

router.get('/top', protect, verified, getTopUsers);
router.get('/position/:userId?', protect, verified, getUserRank);

module.exports = router;