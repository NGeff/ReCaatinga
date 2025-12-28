const express = require('express');
const router = express.Router();
const {
  createAchievement,
  getAllAchievements,
  getUserAchievements,
  deleteAchievement,
} = require('../controllers/achievementController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, createAchievement);
router.get('/', protect, getAllAchievements);
router.get('/user', protect, getUserAchievements);
router.delete('/:id', protect, admin, deleteAchievement);

module.exports = router;