const axios = require('axios');
const FormData = require('form-data');

const PYTHON_SERVICE_URL = 'http://localhost:5001/parse';

/**
 * POST /api/parse
 * Accepts a .pptx file upload, forwards it to the Python parsing service,
 * and returns structured slide data.
 */
async function parsePresentation(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a .pptx file.' });
    }

    // Build FormData to forward to the Python service
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(PYTHON_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 minutes for large files
    });

    const { slideCount, wordCount, slides, fileName } = response.data;

    return res.json({
      slideCount,
      wordCount,
      slides,
      fileName: fileName || req.file.originalname,
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      return res.status(503).json({
        error: 'The parsing service is unavailable. Please ensure the Python service is running on port 5001.',
      });
    }

    if (err.response) {
      // Forward error from the Python service
      const status = err.response.status;
      const message = err.response.data?.error || err.response.data?.detail || 'Parsing service returned an error.';
      return res.status(status).json({ error: message });
    }

    // Generic fallback
    return res.status(500).json({ error: 'Failed to parse the presentation. Please try again.' });
  }
}

module.exports = { parsePresentation };