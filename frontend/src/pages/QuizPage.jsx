import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* ===== Main Component ===== */
export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, fileName, difficulty } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [slideIn, setSlideIn] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintText, setHintText] = useState('');
  const questionRef = useRef(null);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/');
    }
  }, [questions, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger slide-in animation on question change
  useEffect(() => {
    setSlideIn(false);
    setShowHint(false);
    setHintText('');
    const timeout = setTimeout(() => setSlideIn(true), 50);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  const handleRipple = useCallback((e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, []);

  const handleHint = async () => {
    setHintLoading(true);
    setShowHint(true);
    try {
      const response = await fetch('http://localhost:5000/api/quiz/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
        })
      });
      const data = await response.json();
      if (response.ok) {
        setHintText(data.hint);
      } else {
        setHintText('The AI is pondering... try your own wits!');
      }
    } catch {
      setHintText('The AI is pondering... try your own wits!');
    } finally {
      setHintLoading(false);
    }
  };

  if (!questions || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelect = (key) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: key }));
  };

  const handleSubmit = () => {
    navigate('/results', { state: { questions, selectedAnswers, fileName, difficulty } });
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isTimerDanger = timeLeft < 30;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[600px] mx-auto relative z-10">
        <div className="glass-card">
          <div className="shimmer-border" />

          <div className="main-card-content">
            {/* Title Bar */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-black glow-text">
                AI Quiz Challenge
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {difficulty} · {fileName || 'Quiz'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="progress-container">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs font-semibold text-[var(--text-muted)]">
                <span>✦ Start</span>
                <span className="text-[var(--text-secondary)]">{currentIndex + 1}/{totalQuestions}</span>
                <span>✦ Finish</span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${isTimerDanger ? 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)]' : 'border-[var(--border-subtle)] bg-[rgba(148,163,184,0.05)]'}`}>
                <span>⏳</span>
                <span className={`text-xl font-bold ${isTimerDanger ? 'timer-danger' : 'timer-normal'}`}>
                  {formatTime(timeLeft)}
                </span>
                {isTimerDanger && (
                  <span className="text-xs text-[var(--danger)] font-semibold animate-pulse ml-1">
                    Running out of time!
                  </span>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div
              ref={questionRef}
              className={`transition-all duration-500 mb-6 ${slideIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            >
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: 'rgba(26, 31, 46, 0.8)',
                  border: '1px solid var(--border-glow)',
                  position: 'relative',
                }}
              >
                {/* Purple decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--cosmic-purple)] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--cosmic-cyan)] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--cosmic-cyan)] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--cosmic-purple)] rounded-br-lg" />

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[var(--cosmic-purple)] bg-[rgba(139,92,246,0.1)] px-3 py-1 rounded-full">
                    Question {currentIndex + 1}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-snug text-[var(--text-primary)]">
                  {currentQuestion.question}
                </h3>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = selectedAnswers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="option-key">{key}</span>
                    <span>{value}</span>
                    {isSelected && (
                      <span className="ml-auto" style={{ color: 'var(--cosmic-purple)' }}>✦</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Button */}
            <div className="text-center mb-4">
              <button
                onClick={handleHint}
                className="secondary-btn inline-flex items-center gap-2"
              >
                ✦ AI Hint
              </button>
              {showHint && (
                <div className="mt-3 p-3 rounded-xl border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.04)] text-sm text-left">
                  {hintLoading ? (
                    <span className="text-[var(--text-muted)]">AI is analyzing...</span>
                  ) : (
                    <span style={{ color: 'var(--cosmic-cyan)' }}>✦ {hintText}</span>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className="secondary-btn disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="secondary-btn text-[var(--text-primary)]"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={(e) => { handleRipple(e); handleSubmit(); }}
                  className="cosmic-btn px-5 py-2.5 text-sm"
                >
                  ✦ Submit Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}