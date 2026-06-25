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
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const text = response.data.content[0].text;
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
    const { question, options, userAnswer } = req.body;
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Give a short hint (2-3 sentences) for this question without revealing the answer:\n${question}\nOptions: ${JSON.stringify(options)}`
        }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    res.json({ hint: response.data.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
