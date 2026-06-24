const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-20250514';

/**
 * Build the system prompt for MCQ generation based on difficulty.
 */
function buildSystemPrompt(difficulty) {
  const difficultyInstructions = {
    Simple: `Generate Simple (recall-level) multiple-choice questions.
- Focus on direct recall of facts, definitions, and basic concepts.
- Questions should be straightforward with one clearly correct answer.
- Distractors should be plausible but clearly wrong to someone who knows the material.`,
    Medium: `Generate Medium (application-level) multiple-choice questions.
- Focus on applying concepts to new situations or scenarios.
- Questions may require combining multiple pieces of information.
- Distractors should include common misconceptions or near-misses.`,
    Complex: `Generate Complex (analysis/scenario-based) multiple-choice questions.
- Focus on analyzing, evaluating, or synthesizing information.
- Present realistic scenarios or case studies that require critical thinking.
- Distractors should be sophisticated and require deep understanding to eliminate.`,
  };

  return `You are an expert quiz generator for educational content. Your task is to create high-quality multiple-choice questions based on the provided slide content.

${difficultyInstructions[difficulty] || difficultyInstructions.Medium}

You MUST respond with ONLY a valid JSON array of question objects. Do NOT include any markdown formatting, code fences, or explanatory text. The response must be parseable by JSON.parse().

Each question object must follow this exact schema:
{
  "id": 1,
  "question": "The question text here?",
  "options": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correctAnswer": "A",
  "explanation": "A brief explanation of why this answer is correct, referencing the source material.",
  "difficulty": "${difficulty}",
  "slideReference": 1
}

Rules:
- Generate exactly the requested number of questions.
- Distribute correct answers evenly across A, B, C, D.
- Ensure all options are plausible and similar in length/style.
- The explanation should help the learner understand why the correct answer is right.
- slideReference should be the slide number the content came from (1-based).`;
}

/**
 * POST /api/quiz/generate
 * Generates MCQs from slide content using Anthropic Claude.
 */
async function generateQuiz(req, res, next) {
  try {
    const { slideContent, questionCount, difficulty, fileName } = req.body;

    // Validate required fields
    if (!slideContent || !Array.isArray(slideContent) || slideContent.length === 0) {
      return res.status(400).json({ error: 'slideContent must be a non-empty array of slide objects.' });
    }

    const count = Number(questionCount) || 5;
    if (count < 1 || count > 50) {
      return res.status(400).json({ error: 'questionCount must be between 1 and 50.' });
    }

    const validDifficulties = ['Simple', 'Medium', 'Complex'];
    const resolvedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'Medium';

    // Build a condensed text representation of the slides for the prompt
    const slideText = slideContent
      .map((s) => `[Slide ${s.slideNumber}]\nTitle: ${s.title || 'Untitled'}\nContent: ${s.content || ''}`)
      .join('\n\n');

    const userPrompt = `Generate ${count} ${resolvedDifficulty} difficulty multiple-choice questions based on the following presentation content.

Presentation file: ${fileName || 'Unknown'}

Slide content:
${slideText}

Return exactly ${count} questions as a JSON array.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(resolvedDifficulty),
      messages: [
        { role: 'user', content: userPrompt },
      ],
    });

    // Extract the text content from the response
    const contentBlock = response.content.find((block) => block.type === 'text');
    if (!contentBlock) {
      return res.status(500).json({ error: 'Unexpected response format from AI service.' });
    }

    let rawText = contentBlock.text.trim();

    // Strip markdown code fences if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch (parseErr) {
      return res.status(500).json({
        error: 'Failed to parse AI response as JSON. The model returned an unexpected format.',
        raw: rawText,
      });
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: 'AI response was not a JSON array.' });
    }

    return res.json(questions);
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      return res.status(500).json({ error: 'Invalid or missing Anthropic API key. Please check your .env configuration.' });
    }

    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service rate limit exceeded. Please try again later.' });
    }

    return res.status(500).json({ error: 'Failed to generate quiz questions. Please try again.' });
  }
}

/**
 * POST /api/quiz/hint
 * Returns a helpful hint for a given question and the user's answer.
 */
async function getHint(req, res, next) {
  try {
    const { question, options, userAnswer } = req.body;

    if (!question || !options) {
      return res.status(400).json({ error: 'Both "question" and "options" are required.' });
    }

    const optionsText = Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const userAnswerText = userAnswer
      ? `\nThe user selected option "${userAnswer}" (${options[userAnswer] || 'Unknown'}).`
      : '';

    const hintPrompt = `You are a helpful tutor. A student is working on the following multiple-choice question:

Question: ${question}
Options:
${optionsText}${userAnswerText}

Provide a helpful hint that guides the student toward the correct answer without directly revealing it.
- If the student selected an answer, address why it might be incorrect and point them in the right direction.
- If no answer was selected, give a general hint about how to approach the question.
- Keep the hint concise (2-4 sentences).
- Do NOT reveal the correct answer letter or repeat the options verbatim.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: 'You are a helpful tutor who provides concise, Socratic-style hints to guide students toward the correct answer without giving it away directly.',
      messages: [
        { role: 'user', content: hintPrompt },
      ],
    });

    const contentBlock = response.content.find((block) => block.type === 'text');
    const hint = contentBlock ? contentBlock.text.trim() : 'Unable to generate a hint at this time.';

    return res.json({ hint });
  } catch (err) {
    if (err.status === 429) {
      return res.status(429).json({ error: 'AI service rate limit exceeded. Please try again later.' });
    }
    return res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
}

module.exports = { generateQuiz, getHint };