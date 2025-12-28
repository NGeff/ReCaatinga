const express = require('express');
const router = express.Router();
const {
  createPhase,
  getAllPhases,
  getPhaseById,
  updatePhase,
  deletePhase,
} = require('../controllers/phaseController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, createPhase);
router.get('/', protect, getAllPhases);
router.get('/:id', protect, getPhaseById);
router.put('/:id', protect, admin, updatePhase);
router.delete('/:id', protect, admin, deletePhase);

module.exports = router;