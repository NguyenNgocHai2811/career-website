const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'korra/posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'],
      transformation: isVideo
        ? [{ quality: 'auto', fetch_format: 'auto' }]
        : [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not supported.'));
  },
});

const profileImageStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'korra/profiles',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto', width: 800, crop: 'limit' }],
    public_id: `${req.user.userId}_${file.fieldname}_${Date.now()}`,
  }),
});

const uploadProfileImage = multer({
  storage: profileImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WebP images are allowed for profile photos.'));
  },
});

// ===========================
// CV DOCUMENT UPLOAD (for job applications)
// ===========================
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'korra/cv',
    resource_type: 'raw', // raw = non-image/video files (PDF, DOC, etc.)
    allowed_formats: ['pdf', 'doc', 'docx'],
    public_id: `${req.user.userId}_cv_${Date.now()}`,
  }),
});

const uploadCV = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF, DOC, DOCX files are allowed for CV uploads.'));
  },
});

module.exports = { cloudinary, upload, uploadProfileImage, uploadCV };

