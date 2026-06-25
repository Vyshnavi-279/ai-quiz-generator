import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import QuizPage from './pages/QuizPage';

// 🟢 FIXED: Explicitly declared as default export so main.jsx can find it!
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SetupPage />} />
      <Route path="/quiz" element={<QuizPage />} />
    </Routes>
  );
}