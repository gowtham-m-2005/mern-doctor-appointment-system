const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(safeName));
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  
  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only JPG, PNG, and PDF files are allowed."), false);
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Invalid file extension. Only .jpg, .jpeg, .png, and .pdf files are allowed."), false);
  }
  
  cb(null, true);
};

// Enhanced upload configuration with security limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow single file upload
  },
});

// Profile picture upload (images only, smaller size)
const profileUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type. Only JPG and PNG images are allowed."), false);
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Invalid file extension. Only .jpg and .png files are allowed."), false);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
    files: 1,
  },
});

module.exports = { upload, profileUpload };
