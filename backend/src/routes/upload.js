const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImage, uploadDocument, uploadAudio, uploadAvatar } = require('../middleware/uploadMiddleware');
const { uploadImage: processImage, uploadAudio: processAudio, uploadDocument: processDocument, uploadAvatar: processAvatar } = require('../config/upload');
const fs = require('fs');

router.post('/image', protect, uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await processImage(req.file);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

router.post('/avatar', protect, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await processAvatar(req.file);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload avatar'
    });
  }
});

router.post('/document', protect, uploadDocument, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    const result = await processDocument(req.file);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
});

router.post('/audio', protect, uploadAudio, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mp4', 'audio/webm'];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid audio type' });
    }

    const result = await processAudio(req.file);

    res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      }
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload audio'
    });
  }
});

module.exports = router;