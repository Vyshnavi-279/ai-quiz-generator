const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parseFile } = require('../controllers/parseController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.pptx')) cb(null, true);
    else cb(new Error('Only .pptx files allowed'));
  }
});

router.post('/', upload.single('file'), parseFile);
module.exports = router;
