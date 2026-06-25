# 📚 AI Quiz Generator

A modern, full-stack web application that transforms PowerPoint presentations into interactive quizzes using AI. Generate flashcards, track your progress, and analyze performance with beautiful visualizations.

![AI Quiz Generator](https://via.placeholder.com/1200x600?text=AI+Quiz+Generator+Screenshot)

## ✨ Features

### Core Features
- 📄 **PPT Upload & Parsing** — Upload PowerPoint files and automatically extract slide content
- 🤖 **AI-Powered Quiz Generation** — Generate multiple-choice questions from slide content using AI
- ❓ **Interactive Quiz Interface** — Take timed quizzes with hint system and progress tracking
- 📊 **Results Dashboard** — View detailed performance metrics with score breakdown
- 📋 **Quiz History** — Track all past quiz attempts with timestamps and scores
- 💾 **Flashcard Mode** — Review slides as interactive flashcards with flip animations
- 📈 **Analytics & Charts** — Visualize performance trends, difficulty breakdown, and accuracy rates

### Extra Features
- 🎨 **Dark Mode** — Full dark mode support with persistent theme preference
- 📥 **PDF Export** — Download quiz results as PDF
- 🎯 **Difficulty Levels** — Questions categorized by difficulty (Simple/Medium/Complex)
- ✓ **Mark as Learned** — Track flashcard progress with learning status
- 🔄 **Quiz Retake** — Retake previous quizzes with the same questions
- 🌐 **CORS Enabled** — Backend supports cross-origin requests
- ⏱️ **Timed Quizzes** — 2-minute countdown timer per question

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 | UI framework |
| | Vite | Build tool & dev server |
| | Tailwind CSS 4 | Styling & dark mode |
| | React Router 7 | Client-side routing |
| | Recharts | Data visualization |
| | Lucide React | Icons |
| | html2pdf.js | PDF export |
| **Backend** | Node.js | Runtime |
| | Express | Web framework |
| | Axios | HTTP client |
| **Parser** | Python 3 | Language |
| | Flask | Web framework |
| | python-pptx | PPT parsing |
| | Flask-CORS | Cross-origin support |

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18+) — [Download](https://nodejs.org/)
- **Python** (v3.8+) — [Download](https://www.python.org/)
- **npm** (v9+) — Comes with Node.js
- **pip** (v21+) — Comes with Python
- **Git** — [Download](https://git-scm.com/)

Verify installations:
```bash
node --version      # v18.0.0 or higher
npm --version       # v9.0.0 or higher
python --version    # Python 3.8 or higher
pip --version       # pip 21.0 or higher
```

## 🚀 Installation

### Option 1: Quick Start (All Services)

Clone the repository:
```bash
git clone https://github.com/yourusername/ai-quiz-generator.git
cd ai-quiz-generator
```

### Terminal 1: Backend (Express)
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### Terminal 2: Parser (Flask)
```bash
cd parser
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Parser runs on http://localhost:5001
```

### Terminal 3: Frontend (React)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Option 2: Using Docker (Coming Soon)
```bash
docker-compose up -d
```

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Express server port | `5000` |
| `PARSER_URL` | Flask parser endpoint | `http://localhost:5001` |
| `AI_API_KEY` | AI service API key | `sk-...` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API endpoint | `http://localhost:5000` |
| `VITE_PARSER_URL` | Parser endpoint | `http://localhost:5001` |

### Parser (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `FLASK_ENV` | Environment mode | `development` |
| `PORT` | Flask server port | `5001` |

## 📁 Project Structure

```
ai-quiz-generator/
├── frontend/                          # React + Vite application
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── Navbar.jsx         # Navigation with theme toggle
│   │   │   └── analytics/
│   │   │       └── ScoreChart.jsx     # Recharts visualizations
│   │   ├── context/
│   │   │   └── ThemeContext.jsx       # Dark mode theme provider
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx         # PPT file upload
│   │   │   ├── ConfigurePage.jsx      # Quiz configuration
│   │   │   ├── QuizPage.jsx           # Interactive quiz
│   │   │   ├── ResultsPage.jsx        # Quiz results & scoring
│   │   │   ├── HistoryPage.jsx        # Past quiz attempts
│   │   │   ├── FlashcardsPage.jsx     # Flashcard mode
│   │   │   └── AnalyticsPage.jsx      # Performance analytics
│   │   ├── App.jsx                    # Router setup
│   │   ├── main.jsx                   # React entry point
│   │   └── index.css                  # Global styles
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   └── package.json
│
├── backend/                           # Express.js API server
│   ├── routes/
│   │   ├── quiz.js                    # Quiz endpoints
│   │   └── parse.js                   # Parse endpoints
│   ├── controllers/
│   │   ├── quizController.js          # Quiz logic
│   │   └── parseController.js         # Parse logic
│   ├── middleware/                    # Express middleware
│   ├── server.js                      # Express app setup
│   └── package.json
│
├── parser/                            # Flask PPT parser
│   ├── app.py                         # Flask application
│   ├── test_parser.py                 # Unit tests
│   ├── requirements.txt                # Python dependencies
│   └── uploads/                       # Temporary file storage
│
├── README.md                          # This file
├── .gitignore                         # Git ignore rules
└── package.json                       # Root package.json
```

## 📡 API Documentation

### Parse API

**Base URL:** `http://localhost:5001`

#### POST `/parse`
Extract text from PowerPoint presentations.

**Request:**
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```
  file: [.pptx file]
  ```

**Response:** `200 OK`
```json
{
  "slideCount": 10,
  "totalWordCount": 2547,
  "slides": [
    {
      "slideNumber": 1,
      "title": "Introduction to Machine Learning",
      "content": "Machine learning is a subset of artificial intelligence...",
      "wordCount": 125
    },
    {
      "slideNumber": 2,
      "title": "Types of Learning",
      "content": "There are three main types of machine learning...",
      "wordCount": 98
    }
  ],
  "fileName": "presentation.pptx"
}
```

**Error Response:** `400/500`
```json
{
  "error": "Invalid file type. Only .pptx files are allowed."
}
```

---

#### GET `/health`
Health check endpoint.

**Response:** `200 OK`
```json
{
  "status": "ok"
}
```

---

### Quiz API

**Base URL:** `http://localhost:5000/api`

#### POST `/quiz/generate`
Generate quiz questions from slide content.

**Request:**
```json
{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Introduction to Machine Learning",
      "content": "Machine learning is a subset of artificial intelligence...",
      "wordCount": 125
    }
  ],
  "numQuestions": 5,
  "difficulty": "medium"
}
```

**Response:** `200 OK`
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is machine learning?",
      "options": {
        "A": "A subset of artificial intelligence",
        "B": "A programming language",
        "C": "A database system",
        "D": "A cloud service"
      },
      "correctAnswer": "A",
      "explanation": "Machine learning is a subset of AI that enables systems to learn from data.",
      "difficulty": "easy",
      "slideReference": 1
    }
  ],
  "totalQuestions": 5
}
```

---

#### POST `/quiz/hint`
Get AI-powered hints for a question.

**Request:**
```json
{
  "question": "What is machine learning?",
  "options": {
    "A": "A subset of artificial intelligence",
    "B": "A programming language",
    "C": "A database system",
    "D": "A cloud service"
  },
  "userAnswer": "B"
}
```

**Response:** `200 OK`
```json
{
  "hint": "Consider the broader category of computer science concepts. Think about what encompasses multiple learning approaches..."
}
```

---

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### Run Backend Tests
```bash
cd backend
npm run test
```

### Run Parser Tests
```bash
cd parser
python -m pytest test_parser.py
```

## 🚢 Deployment

### Deploy to Render (Recommended)

This project includes a `render.yaml` for easy deployment to [Render](https://render.com). All three services (frontend, backend, parser) deploy together.

#### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

#### Manual Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Create a Render account** at [render.com](https://render.com) and connect your GitHub repo.

3. **Use the Blueprint (render.yaml)**:
   - Go to Dashboard → Blueprint
   - Connect your repository
   - Render will auto-detect `render.yaml` and create 3 services:
     - `ai-quiz-frontend` (Static Site)
     - `ai-quiz-backend` (Web Service)
     - `ai-quiz-parser` (Web Service)

4. **Set the API Key** (required):
   - Go to `ai-quiz-backend` → Environment
   - Add `OPENROUTER_API_KEY` with your [OpenRouter](https://openrouter.ai/) API key

5. **Get your deployed URLs**:
   - Frontend: `https://ai-quiz-frontend.onrender.com`
   - Backend: `https://ai-quiz-backend.onrender.com`
   - Parser: `https://ai-quiz-parser.onrender.com`

#### Deploy Updates

Just push to your GitHub repository — Render auto-deploys from the `main` branch.

### Alternative: Docker (Coming Soon)
```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Test your changes before submitting
- Update README.md if adding new features
- Ensure all tests pass (`npm run test`)

### Reporting Issues
Use GitHub Issues to report bugs. Please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 💬 Support

- 📖 [Documentation](https://github.com/yourusername/ai-quiz-generator/wiki)
- 💡 [Issues](https://github.com/yourusername/ai-quiz-generator/issues)
- 📧 [Email Support](mailto:support@example.com)
- 🐦 [Twitter](https://twitter.com/yourusername)

## 🙏 Acknowledgments

- [Recharts](https://recharts.org/) for beautiful charts
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons
- [python-pptx](https://python-pptx.readthedocs.io/) for PPT parsing

---

**Made with ❤️ by AI Quiz Generator Team**

Last Updated: January 2025
