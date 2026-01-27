const express = require('express');
const router = express.Router();
const {
  createGame,
  getGamesByPhase,
  getGameById,
  updateGame,
  deleteGame,
  submitGameScore,
  getGamesByMission,
} = require('../controllers/gameController');
const { protect, admin, verified } = require('../middleware/auth');

router.post('/', protect, admin, createGame);
router.get('/phase/:phaseId', protect, verified, getGamesByPhase);
router.get('/:id', protect, verified, getGameById);
router.get('/mission/:missionId', protect, verified, getGamesByMission);
router.put('/:id', protect, admin, updateGame);
router.delete('/:id', protect, admin, deleteGame);
router.post('/:gameId/submit', protect, verified, submitGameScore);

module.exports = router;