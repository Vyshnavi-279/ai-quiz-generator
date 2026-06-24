const express = require('express');
const router = express.Router();
const { generateQuiz, getHint } = require('../controllers/quizController');

// POST /api/quiz/generate — generate MCQs from slide content
router.post('/generate', generateQuiz);

// POST /api/quiz/hint — get a hint for a specific question
router.post('/hint', getHint);

module.exports = router;