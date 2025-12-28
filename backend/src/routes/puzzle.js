const express = require('express');
const router = express.Router();
const { processPuzzle } = require('../controllers/puzzleController');

router.get('/process', processPuzzle);

module.exports = router;
