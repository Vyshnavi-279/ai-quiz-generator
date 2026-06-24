import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Download, RotateCcw, Upload, BarChart3 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Results Found</h1>
          <p className="text-gray-400 mb-6">Complete a quiz to see your results.</p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold px-6 py-3 rounded-lg transition-all"
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, reviewPayload, date } = result;
  const correctCount = score;
  const wrongCount = totalQuestions - score;

  const getMotivationalMessage = () => {
    if (percentage >= 80) {
      return { text: 'Outstanding Performance! 🎉', color: 'from-green-500 to-emerald-500' };
    } else if (percentage >= 50) {
      return { text: 'Good Job! Keep practicing 💪', color: 'from-blue-500 to-cyan-500' };
    } else {
      return { text: 'Room for Improvement 📚', color: 'from-orange-500 to-red-500' };
    }
  };

  const motivation = getMotivationalMessage();

  const toggleExpanded = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('results-content');
    const opt = {
      margin: 10,
      filename: `quiz-results-${date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const handleRetakeQuiz = () => {
    navigate('/configure', { state: { sourceData: { questions: reviewPayload.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      slideReference: q.slideReference,
      difficulty: q.difficulty
    })) } } });
  };

  const handleUploadNew = () => {
    navigate('/upload');
  };

  const handleViewAnalytics = () => {
    navigate('/analytics', { state: { result, reviewPayload } });
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8" id="results-content">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Quiz Complete!
          </h1>
          <p className="text-gray-400 text-sm">Completed on {date}</p>
        </div>

        {/* Score Gauge */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#1C2541" strokeWidth="12" />

              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeDasharray={`${(percentage / 100) * 565.48} 565.48`}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dasharray 0.5s ease' }}
              />

              {/* Gradient */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* Center text */}
              <text x="100" y="100" textAnchor="middle" dy="0.3em" className="text-2xl font-bold fill-white">
                <tspan x="100" dy="0">{percentage}%</tspan>
              </text>
              <text x="100" y="100" textAnchor="middle" dy="1.5em" className="text-lg fill-gray-400">
                <tspan x="100" dy="1.2em">{score}/{totalQuestions}</tspan>
              </text>
            </svg>
          </div>
        </div>

        {/* Motivational Message */}
        <div className={`bg-gradient-to-r ${motivation.color} rounded-xl p-6 text-center`}>
          <p className="text-lg md:text-xl font-bold text-white">{motivation.text}</p>
        </div>

        {/* Stats Badges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">✓ {correctCount}</p>
            <p className="text-sm text-gray-300">Correct</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-400">✗ {wrongCount}</p>
            <p className="text-sm text-gray-300">Wrong</p>
          </div>
        </div>

        {/* Review Section */}
        {reviewPayload && reviewPayload.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Answer Review</h2>
            <div className="space-y-3">
              {reviewPayload.map((question) => (
                <div
                  key={question.id}
                  className={`rounded-lg border overflow-hidden transition-all ${
                    question.isCorrect
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => !question.isCorrect && toggleExpanded(question.id)}
                    className="w-full p-4 flex items-start justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start space-x-3 text-left flex-1">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        question.isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {question.isCorrect ? '✓' : '✗'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm md:text-base break-words">
                          {question.question}
                        </p>
                        {question.isCorrect && (
                          <p className="text-xs text-green-300 mt-1">
                            Your answer: {question.options[question.userAnswer] || question.userAnswer}
                          </p>
                        )}
                      </div>
                    </div>
                    {!question.isCorrect && (
                      <div className="flex-shrink-0 ml-2">
                        {expandedQuestions[question.id] ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded Details (for wrong answers) */}
                  {!question.isCorrect && expandedQuestions[question.id] && (
                    <div className="border-t border-red-500/30 p-4 space-y-4 bg-black/20">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Your Answer</p>
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                          <p className="text-red-300 text-sm">
                            {question.options[question.userAnswer] || 'Not answered'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Correct Answer</p>
                        <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                          <p className="text-green-300 text-sm font-semibold">
                            {question.options[question.correctAnswer]}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Explanation</p>
                        <div className="bg-teal-500/10 border border-teal-500/20 rounded p-3">
                          <p className="text-teal-100 text-sm leading-relaxed">
                            {question.explanation || 'Review the relevant slide content for more information.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-800">
          <button
            onClick={handleRetakeQuiz}
            className="flex items-center justify-center space-x-2 bg-[#1C2541] hover:bg-[#2A3F5F] border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Retake Quiz</span>
          </button>

          <button
            onClick={handleUploadNew}
            className="flex items-center justify-center space-x-2 bg-[#1C2541] hover:bg-[#2A3F5F] border border-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <Upload className="h-5 w-5" />
            <span>Upload New PPT</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <Download className="h-5 w-5" />
            <span>📥 Download Results PDF</span>
          </button>

          <button
            onClick={handleViewAnalytics}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            <BarChart3 className="h-5 w-5" />
            <span>📊 View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}