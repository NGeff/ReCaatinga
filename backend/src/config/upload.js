const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/mp4', 'audio/webm'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file, type) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (type === 'image') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid image format. Allowed: JPG, PNG, GIF, WEBP');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error('Image too large. Max 5MB');
    }
  } else if (type === 'audio') {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid audio format. Allowed: MP3, WAV, OGG, M4A, WEBM');
    }
    if (file.size > MAX_AUDIO_SIZE) {
      throw new Error('Audio too large. Max 10MB');
    }
  } else if (type === 'document') {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid document format. Allowed: PDF, DOC, DOCX, TXT');
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new Error('Document too large. Max 10MB');
    }
  }
}

async function uploadToCloudinary(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: options.resource_type || 'auto',
      folder: options.folder || 'uploads',
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

async function uploadImage(file) {
  try {
    validateFile(file, 'image');
    
    const result = await uploadToCloudinary(file.path, {
      resource_type: 'image',
      folder: 'images',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.url,
      publicId: result.publicId,
    };
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }
  }
}

async function uploadAudio(file) {
  try {
    validateFile(file, 'audio');
    
    const result = await uploadToCloudinary(file.path, {
      resource_type: 'video', // Cloudinary usa 'video' para áudio
      folder: 'audio',
    });
    
    return {
      url: result.url,
      publicId: result.publicId,
    };
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }
  }
}

async function uploadDocument(file) {
  try {
    validateFile(file, 'document');
    
    const result = await uploadToCloudinary(file.path, {
      resource_type: 'raw', // Para documentos
      folder: 'documents',
    });
    
    return {
      url: result.url,
      publicId: result.publicId,
    };
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }
  }
}

async function uploadAvatar(file) {
  try {
    validateFile(file, 'image');
    
    const result = await uploadToCloudinary(file.path, {
      resource_type: 'image',
      folder: 'avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.url,
      publicId: result.publicId,
    };
  } finally {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.error('Error deleting temp file:', err);
    }
  }
}

async function deleteFile(publicId) {
  try {
    // Detecta o tipo de recurso baseado no publicId
    let resourceType = 'image';
    if (publicId.includes('audio/')) {
      resourceType = 'video';
    } else if (publicId.includes('documents/')) {
      resourceType = 'raw';
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      console.log(`Successfully deleted ${publicId} from Cloudinary`);
      return true;
    } else {
      console.log(`Failed to delete ${publicId}: ${result.result}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting ${publicId} from Cloudinary:`, error.message);
    return false;
  }
}

// Limpeza de arquivos temporários locais
const cleanupTempFiles = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) return;
  
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hora
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return;
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > maxAge) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
};

// Executa limpeza a cada hora
setInterval(cleanupTempFiles, 60 * 60 * 1000);

module.exports = {
  uploadImage,
  uploadAudio,
  uploadDocument,
  uploadAvatar,
  deleteFile,
  cloudinary,
};
