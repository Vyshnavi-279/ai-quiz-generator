import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* ===== Starfield ===== */
function Starfield() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 3,
  }));

  return (
    <div className="starfield">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ===== Golden Particles ===== */
function GoldenParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 8 + Math.random() * 10,
    delay: Math.random() * 8,
  }));

  return (
    <div className="golden-particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="golden-particle"
          style={{
            left: `${p.left}%`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ===== Racing Cars ===== */
function RacingCars() {
  const Car1 = () => (
    <div className="racing-car car-1">
      <div className="car-body gryffindor">
        <div className="cockpit" />
        <div className="spoiler" />
        <div className="gryffindor-stripe" />
        <div className="car-wheels">
          <div className="wheel" />
          <div className="wheel" />
        </div>
        <div className="wizard-hat" />
        <div className="wizard-hat-brim" />
        <span className="hat-star">★</span>
      </div>
      <div className="exhaust-flame" />
    </div>
  );

  const Car2 = () => (
    <div className="racing-car car-2">
      <div className="car-body slytherin">
        <div className="cockpit" />
        <div className="spoiler" />
        <div className="slytherin-stripe" />
        <div className="car-wheels">
          <div className="wheel" />
          <div className="wheel" />
        </div>
        <div className="wizard-hat" />
        <div className="wizard-hat-brim" />
        <span className="hat-star">★</span>
      </div>
      <div className="exhaust-flame" />
    </div>
  );

  return (
    <div className="racing-cars-container">
      <Car1 />
      <Car2 />
      <div className="race-track-line" />
    </div>
  );
}

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

  return <span className={`text-5xl font-black gold-glow ${done ? '' : ''}`}>{count}</span>;
}

/* ===== Main Component ===== */
export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, selectedAnswers, fileName, difficulty } = location.state || {};

  const [ringDrawn, setRingDrawn] = useState(false);

  if (!questions) {
    navigate('/');
    return null;
  }

  const correct = questions.filter(q => selectedAnswers[q.id] === q.correctAnswer);
  const score = correct.length;
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const circumference = 2 * Math.PI * 54;
  const strokeDash = (percentage / 100) * circumference;
  const targetOffset = circumference - strokeDash;

  const getMessage = () => {
    if (percentage >= 80) return '🏆 You are a true wizard!';
    if (percentage >= 50) return '📚 Good magic, keep practicing!';
    return '📚 Return to the library, young wizard';
  };

  // Trigger ring draw
  useEffect(() => {
    const timer = setTimeout(() => setRingDrawn(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const saveHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
      history.unshift({ fileName, difficulty, score, total, percentage, date: new Date().toISOString() });
      localStorage.setItem('quizHistory', JSON.stringify(history));
    } catch {}
  };
  saveHistory();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Starfield />
      <GoldenParticles />
      <RacingCars />
      <div className="fog-overlay" />

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
              ✨
            </span>
          ))}
        </div>
      )}

      <div className="w-full max-w-[600px] mx-auto relative z-10">
        <div className="glass-card">
          <div className={`shimmer-border ${percentage >= 80 ? 'opacity-100' : ''}`} />

          <div className="main-card-content text-center">
            {/* Logo */}
            <div className="mb-6">
              <span className="text-5xl">⚡</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black gold-glow mb-2">
              The Final Prophecy
            </h1>
            <p className="text-[var(--sage-green)] text-sm md:text-base mb-8">
              {difficulty} · {fileName || 'Unknown scroll'}
            </p>

            {/* Score Ring */}
            <div className="flex flex-col items-center mb-8">
              <div className="score-ring-container mb-4">
                <svg width="180" height="180" viewBox="0 0 120 120">
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="100%" stopColor="#c41e3a" />
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
                  <text x="60" y="50" textAnchor="middle" fill="#ffd700" fontSize="28" fontFamily="Cinzel" fontWeight="900">
                    <CountUp target={score} />
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#a8c5a0" fontSize="14" fontFamily="Rajdhani" fontWeight="600">
                    / {total}
                  </text>
                </svg>
              </div>

              {/* Percentage */}
              <p style={{ color: percentage >= 80 ? 'var(--magical-gold)' : 'var(--sage-green)' }} className="text-2xl font-black">
                {percentage}%
              </p>
              <p className="text-sm font-semibold text-[var(--sage-green)]">Final Score</p>

              {/* Grade */}
              <div className={`mt-4 px-5 py-2 rounded-full border ${percentage >= 80 ? 'border-[var(--magical-gold)] bg-[rgba(255,215,0,0.1)]' : percentage < 50 ? 'border-[rgba(74,144,164,0.4)] bg-[rgba(74,144,164,0.08)]' : 'border-[var(--gold-border)] bg-[rgba(255,215,0,0.05)]'}`}
              >
                <p className={`text-lg font-bold ${percentage >= 80 ? 'text-[var(--magical-gold)]' : percentage < 50 ? 'text-[var(--ravenclaw-blue)]' : 'text-[var(--sage-green)]'}`}>
                  {getMessage()}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="p-3 rounded-xl border border-[rgba(92,184,92,0.3)] bg-[rgba(92,184,92,0.08)]">
                  <p className="text-xl font-black" style={{ color: '#5cb85c' }}>{score}</p>
                  <p className="text-xs font-semibold" style={{ color: '#5cb85c' }}>✓ Correct</p>
                </div>
                <div className="p-3 rounded-xl border border-[rgba(192,57,43,0.3)] bg-[rgba(192,57,43,0.08)]">
                  <p className="text-xl font-black" style={{ color: '#c0392b' }}>{total - score}</p>
                  <p className="text-xs font-semibold" style={{ color: '#c0392b' }}>✗ Wrong</p>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-[var(--magical-gold)] mb-4 flex items-center gap-2">
                <span>★</span> Review Your Answers
              </h3>

              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className="slide-up"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className={`result-card ${isCorrect ? 'correct' : 'wrong'}`}>
                        <p className="font-bold text-sm mb-2" style={{ color: 'var(--sage-green)' }}>
                          {isCorrect ? '✓' : '✗'} Q{i + 1}. {q.question}
                        </p>
                        {isCorrect ? (
                          <p className="text-sm font-semibold" style={{ color: '#5cb85c' }}>
                            {userAnswer} — {q.options[userAnswer]}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-semibold" style={{ color: '#c0392b' }}>
                              Your answer: {userAnswer ? `${userAnswer} — ${q.options[userAnswer]}` : 'Not answered'}
                            </p>
                            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--sage-green)' }}>
                              Correct: {q.correctAnswer} — {q.options[q.correctAnswer]}
                            </p>
                            {q.explanation && (
                              <div className="crystal-ball mt-2">
                                <p className="text-sm" style={{ color: 'var(--ravenclaw-blue)' }}>
                                  🔮 {q.explanation}
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
                className="magical-btn flex-1 py-3.5 text-sm"
              >
                🔄 Cast Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm border border-[var(--gold-border)] bg-transparent text-[var(--sage-green)] hover:bg-[rgba(255,215,0,0.05)] transition-all"
              >
                📜 New Scroll
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}