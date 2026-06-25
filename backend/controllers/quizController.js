const axios = require('axios');

exports.generateQuiz = async (req, res) => {
  try {
    const { slideContent, questionCount, difficulty, fileName } = req.body;

    const difficultyGuide = {
      Simple: 'recall-based, definitions, straightforward facts',
      Medium: 'application and understanding, scenario-based',
      Complex: 'analysis, evaluation, multi-step reasoning'
    };

    const prompt = `You are a quiz generator. Based on this PowerPoint content, generate exactly ${questionCount} multiple choice questions.

Difficulty: ${difficulty} (${difficultyGuide[difficulty]})

Slide Content:
${slideContent}

Return ONLY a valid JSON array, no other text:
[
  {
    "id": 1,
    "question": "question text here",
    "options": { "A": "option1", "B": "option2", "C": "option3", "D": "option4" },
    "correctAnswer": "A",
    "explanation": "why this is correct and others are wrong",
    "difficulty": "${difficulty}",
    "slideReference": 1
  }
]`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4-5',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'AI Quiz Generator'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON found in response');
    const questions = JSON.parse(jsonMatch[0]);
    res.json({ questions });
  } catch (err) {
    console.error('Quiz generation error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getHint = async (req, res) => {
  try {
    const { question, options } = req.body;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4-5',
        messages: [{
          role: 'user',
          content: `Give a short hint (2-3 sentences) without revealing the answer:\n${question}\nOptions: ${JSON.stringify(options)}`
        }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'AI Quiz Generator'
        }
      }
    );
    res.json({ hint: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
