const express = require('express');
const cors = require('cors');
const multer = require('multer');
const officeParser = require('officeparser');
const fs = require('fs');

const app = express();
const PORT = 5001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// In-memory string variable to preserve slide text details between routes
let extractedSlidesText = "Cyber security overview, network defenses, threat landscapes.";

// Base endpoint check
app.get('/', (req, res) => {
  res.send('🚀 Quiz Backend is active and responding on port 5001!');
});

// 1. Upload Endpoint - Pulls actual text
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No file uploaded." });
  }

  // 🟢 FIX: Use parseOffice instead of parseOfficeAsync
  officeParser.parseOffice(req.file.path)
    .then((data) => {
      extractedSlidesText = data;
      console.log("📝 Real text pulled from slides successfully!");
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path); 
      }
      res.json({ success: true, slideCount: 10 });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ success: false, error: "Failed to parse PPTX." });
    });
});

// 2. Generation Endpoint - Dynamically calls the Gemini SDK
app.post('/api/generate', async (req, res) => {
  const { numQuestions, difficulty, topic } = req.body;
  console.log(`⚡ Querying Gemini to generate ${numQuestions} questions for topic: ${topic}`);

  const systemPrompt = `
    You are an expert quiz generator. Your task is to generate a multiple-choice quiz based ONLY on the provided context material.
    Generate exactly ${numQuestions} questions at a "${difficulty}" difficulty level.
    
    You must return a valid JSON array matching this exact structure:
    [
      {
        "id": 1,
        "question": "The question text here?",
        "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
        "answer": "The exact string corresponding to the correct Choice"
      }
    ]
    Do not wrap the response in markdown code blocks like \`\`\`json. Return pure JSON data.
  `;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    
    // 🟢 FIX: Only declare 'geminiAI' once right here to prevent name collisions
    // 🟢 FIX: Swap out the placeholder for your real Gemini API key string
const geminiAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyYOUR_REAL_KEY_GOES_HERE" });

    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context Content: ${extractedSlidesText}\n\nTopic: ${topic}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json"
      }
    });

    const cleanText = response.text.trim();
    const questionsArray = JSON.parse(cleanText);

    res.json({
      success: true,
      questions: questionsArray
    });

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ success: false, error: "AI generation sequence failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Quiz Backend Server live on http://localhost:5001`);
});