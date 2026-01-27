const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  submitTask,
  getPendingTasks,
  getMySubmissions,
  reviewTask,
} = require('../controllers/taskSubmissionController');
const { protect, admin, verified } = require('../middleware/auth');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'task-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|heic|heif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPEG, PNG, HEIC)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

router.post('/submit', protect, verified, upload.single('photo'), submitTask);
router.get('/pending', protect, admin, getPendingTasks);
router.get('/my-submissions', protect, verified, getMySubmissions);
router.put('/review/:submissionId', protect, admin, reviewTask);

module.exports = router;