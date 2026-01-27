const express = require('express');
const router = express.Router();
const {
  getUserProgress,
  getPhaseProgress,
  getOverallProgress,
  markVideoWatched,
  completeMission,
} = require('../controllers/progressController');
const { protect, verified } = require('../middleware/auth');

router.get('/', protect, verified, getUserProgress);
router.get('/phase/:phaseId', protect, verified, getPhaseProgress);
router.get('/overall', protect, verified, getOverallProgress);
router.post('/video/:phaseId', protect, verified, markVideoWatched);
router.post('/mission/:missionId', protect, verified, completeMission);

module.exports = router;