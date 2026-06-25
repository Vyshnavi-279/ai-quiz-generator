import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* ===== Animated Score Counter ===== */
function CountUp({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) setDone(true);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span className="text-5xl font-black glow-text">{count}</span>;
}

/* ===== Main Component ===== */
export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, selectedAnswers = {}, fileName, difficulty } = location.state || {};

  const [ringDrawn, setRingDrawn] = useState(false);

  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/', { replace: true });
      return;
    }

    const timer = setTimeout(() => setRingDrawn(true), 300);
    return () => clearTimeout(timer);
  }, [questions, navigate]);

  if (!questions || questions.length === 0) {
    return null;
  }

  const correct = questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer);
  const score = correct.length;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const circumference = 2 * Math.PI * 54;
  const strokeDash = (percentage / 100) * circumference;
  const targetOffset = circumference - strokeDash;

  const getMessage = () => {
    if (percentage >= 80) return '✦ Outstanding! You\'re a Quiz Master!';
    if (percentage >= 50) return '✦ Good work! Keep learning!';
    return '✦ Keep practicing, you\'ll improve!';
  };

  const getGrade = () => {
    if (percentage >= 90) return 'S';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      history.unshift({ fileName, difficulty, score, total, percentage, date: new Date().toISOString() });
      localStorage.setItem('quizHistory', JSON.stringify(history));
    } catch {}
  }, [fileName, difficulty, score, total, percentage]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
      {/* High Score Sparkles */}
      {percentage >= 80 && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {Array.from({ length: 20 }, (_, i) => (
            <span
              key={i}
              className="sparkle-fall"
              style={{
                left: `${Math.random() * 100}%`,
                '--duration': `${2 + Math.random() * 3}s`,
                '--delay': `${Math.random() * 2}s`,
              }}
            >
              ✦
            </span>
          ))}
        </div>
      )}

      <div className="w-full max-w-[620px] mx-auto relative z-10">
        <div className="glass-card">
          <div className={`shimmer-border ${percentage >= 80 ? 'opacity-100' : ''}`} />

          <div className="main-card-content text-center">
            {/* Badge */}
            <div className="mb-5 badge mx-auto w-fit">
              <span className="text-[var(--cosmic-purple)]">✦</span>
              Quiz Complete
            </div>

            {/* Logo */}
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cosmic-purple)] to-[var(--cosmic-blue)] shadow-lg shadow-[var(--cosmic-glow)] mx-auto">
                <span className="text-3xl floating">✦</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black glow-text mb-2 leading-tight">
              Quiz Results
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base mb-8 opacity-90">
              {difficulty} · {fileName || 'Unknown file'}
            </p>

            {/* Score Ring */}
            <div className="flex flex-col items-center mb-8">
              <div className="score-ring-container mb-4">
                <svg width="200" height="200" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {/* Background ring */}
                  <circle className="score-ring-bg" cx="60" cy="60" r="54" />
                  {/* Score ring fill */}
                  <circle
                    className="score-ring-fill"
                    cx="60" cy="60" r="54"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={ringDrawn ? targetOffset : circumference}
                  />
                  {/* Center text */}
                  <text x="60" y="50" textAnchor="middle" fill="#f1f5f9" fontSize="28" fontFamily="Space Grotesk" fontWeight="900">
                    <CountUp target={score} />
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="14" fontFamily="Outfit" fontWeight="600">
                    / {total}
                  </text>
                </svg>
              </div>

              {/* Percentage */}
              <p className="text-2xl font-black gradient-text mb-1">
                {percentage}%
              </p>
              <p className="text-sm font-semibold text-[var(--text-muted)]">Final Score</p>

              {/* Grade */}
              <div className={`mt-4 px-5 py-2 rounded-full border ${percentage >= 80 ? 'border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.08)]' : percentage < 50 ? 'border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.04)]' : 'border-[var(--border-glow)] bg-[rgba(139,92,246,0.05)]'}`}
              >
                <p className={`text-lg font-bold ${percentage >= 80 ? 'text-[var(--cosmic-purple)]' : percentage < 50 ? 'text-[var(--cosmic-cyan)]' : 'text-[var(--text-secondary)]'}`}>
                  {getMessage()}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="p-3 rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.04)]">
                  <p className="text-xl font-black" style={{ color: 'var(--success)' }}>{score}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>✓ Correct</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)]">
                  <p className="text-xl font-black" style={{ color: 'var(--danger)' }}>{total - score}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>✗ Wrong</p>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border-glow)] bg-[rgba(139,92,246,0.04)]">
                  <p className="text-xl font-black gradient-text">{getGrade()}</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)]">Grade</p>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="text-[var(--cosmic-purple)]">✦</span> Review Your Answers
              </h3>

              <div className="space-y-3">
                {questions.map((q, i) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className="slide-up"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className={`result-card ${isCorrect ? 'correct' : 'wrong'}`}>
                        <p className="font-bold text-sm mb-2 text-[var(--text-primary)]">
                          {isCorrect ? '✓' : '✗'} Q{i + 1}. {q.question}
                        </p>
                        {isCorrect ? (
                          <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                            {userAnswer} — {q.options[userAnswer]}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                              Your answer: {userAnswer ? `${userAnswer} — ${q.options[userAnswer]}` : 'Not answered'}
                            </p>
                            <p className="text-sm font-semibold mt-1 text-[var(--text-secondary)]">
                              Correct: {q.correctAnswer} — {q.options[q.correctAnswer]}
                            </p>
                            {q.explanation && (
                              <div className="crystal-ball mt-2">
                                <p className="text-sm" style={{ color: 'var(--cosmic-cyan)' }}>
                                  ✦ {q.explanation}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/quiz', { state: { questions, fileName, difficulty } })}
                className="cosmic-btn flex-1 py-3.5 text-sm"
              >
                ✦ Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="secondary-btn flex-1 py-3.5 text-sm"
              >
                ✦ New Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}