 import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, ChevronLeft, ChevronRight, Check, Lightbulb, Loader2 } from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safely extract questions passed from configuration/source data state
  const mockQuestions = [
    {
      id: 1,
      question: "Sample Question: What is the main characteristic of Supervised Learning?",
      options: { A: "No labeled data", B: "Uses labeled datasets to train algorithms", C: "Learns through trial and error", D: "Clusters data organically" },
      correctAnswer: "B",
      explanation: "Supervised learning relies explicitly on input-output mapping pairs.",
      slideReference: 2
    }
  ];

  const questions = location.state?.questions || location.state?.sourceData?.questions || mockQuestions;

  // App States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // format: { [questionId]: 'A' }
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes (120s) per question default
  
  // Hint states
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [showHintCard, setShowHintCard] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(120);
    setHint('');
    setShowHintCard(false);
  }, [currentIndex]);

  // Countdown timer tracking
  useEffect(() => {
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeout = () => {
    // Save current selection as empty string if untouched
    if (!selectedAnswers[currentQuestion.id]) {
      setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: "" }));
    }
    // Auto advance or submit
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleOptionSelect = (optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionKey
    }));
  };

  // Async request to fetch Socratic hint framework
  const handleFetchHint = async () => {
    setLoadingHint(true);
    setShowHintCard(true);
    try {
      const response = await fetch('/api/quiz/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          userAnswer: selectedAnswers[currentQuestion.id] || null
        })
      });
      const data = await response.json();
      setHint(data.hint || 'Try reviewing structural components carefully.');
    } catch (err) {
      setHint('Think about the fundamental properties discussed on the corresponding slides.');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = () => {
    // Process final score parameters
    let score = 0;
    const reviewPayload = questions.map((q) => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        ...q,
        userAnswer: selectedAnswers[q.id] || "",
        isCorrect
      };
    });

    const quizResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      reviewPayload
    };

    // Save history array into localStorage persistence wrapper
    const currentHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    localStorage.setItem('quiz_history', JSON.stringify([quizResult, ...currentHistory]));

    // Route transitions over to results dashboard layout metrics
    navigate('/results', { state: { result: quizResult } });
  };

  // UI Format Assistant
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Top Progress & Timer Metrics bar header tracking */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-gray-400">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <div className="flex items-center space-x-1.5 bg-[#1C2541] px-3 py-1.5 rounded-full border border-gray-700">
              <Clock className={`h-4 w-4 ${timeLeft < 20 ? 'text-red-400 animate-pulse' : 'text-teal-400'}`} />
              <span className={timeLeft < 20 ? 'text-red-400 font-bold' : 'text-gray-200'}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="w-full bg-[#1C2541] h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Area Box container layouts */}
        <div className="bg-[#1C2541]/50 border border-gray-700 rounded-xl p-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
            {currentQuestion.slideReference ? `Slide Reference: Slide ${currentQuestion.slideReference}` : 'Context Query'}
          </span>
          <h2 className="text-xl md:text-2xl font-bold leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Interactive Four Option Grid Cards section component structure */}
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = selectedAnswers[currentQuestion.id] === key;
            return (
              <button
                key={key}
                onClick={() => handleOptionSelect(key)}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                  isSelected 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-200 ring-2 ring-amber-500/20' 
                    : 'bg-[#1C2541]/30 border-gray-700 text-gray-300 hover:border-teal-500/50 hover:bg-[#1C2541]/60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border transition-all ${
                    isSelected 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-gray-800 border-gray-600 text-gray-400 group-hover:border-teal-400 group-hover:text-teal-400'
                  }`}>
                    {key}
                  </span>
                  <span className="font-medium text-sm md:text-base">{value}</span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Hint Integration Tooltip Context Section card */}
        <div className="space-y-2">
          <div className="flex justify-start">
            <button
              onClick={handleFetchHint}
              className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-teal-400 hover:text-teal-300 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Request AI Hint</span>
            </button>
          </div>
          {showHintCard && (
            <div className="bg-[#0B132B] border border-teal-500/30 rounded-xl p-4 flex items-start space-x-3 transition-opacity animate-fadeIn">
              <HelpCircle className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-teal-100/90 leading-relaxed">
                  {loadingHint ? (
                    <span className="flex items-center space-x-2 text-gray-400">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
                      <span>Consulting intelligent agent context...</span>
                    </span>
                  ) : hint}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Action Controls array container */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center space-x-1 px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white font-bold px-5 py-2.5 rounded-lg border border-gray-700 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 shadow-lg shadow-teal-500/10 text-slate-950 font-extrabold px-6 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              Submit Quiz
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
