const express = require('express');
const router = express.Router();
const { generateQuiz, getHint } = require('../controllers/quizController');
router.post('/generate', generateQuiz);
router.post('/hint', getHint);
module.exports = router;
