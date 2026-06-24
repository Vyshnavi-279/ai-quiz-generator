const express = require('express');
const multer = require('multer');
const router = express.Router();
const { parsePresentation } = require('../controllers/parseController');

// Multer configuration: memory storage, 25MB limit, .pptx only
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only .pptx files are allowed.');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter,
});

// POST /api/parse — upload a .pptx file for parsing
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 25 MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      // Custom error from fileFilter
      return res.status(err.status || 400).json({ error: err.message });
    }
    next();
  });
}, parsePresentation);

module.exports = router;