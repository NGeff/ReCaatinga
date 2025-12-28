const express = require('express');
const router = express.Router();
const {
  createMission,
  getMissionsByPhase,
  getMissionById,
  updateMission,
  deleteMission,
} = require('../controllers/missionController');
const { protect, admin, verified } = require('../middleware/auth');

router.post('/', protect, admin, createMission);
router.get('/phase/:phaseId', protect, verified, getMissionsByPhase);
router.get('/:id', protect, verified, getMissionById);
router.put('/:id', protect, admin, updateMission);
router.delete('/:id', protect, admin, deleteMission);

module.exports = router;