require('dotenv').config();

const express = require('express');
const cors = require('cors');

const parseRoutes = require('./routes/parse');
const quizRoutes = require('./routes/quiz');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/parse', parseRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});