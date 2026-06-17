const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPG, PNG, WebP, PDF.'), false);
  }
};

const limits = { fileSize: 10 * 1024 * 1024 };

const upload = multer({
  storage: process.env.VERCEL ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits,
});

module.exports = upload;
