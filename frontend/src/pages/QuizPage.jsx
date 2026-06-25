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
        setHintText('The crystal ball is cloudy... try your own wits!');
      }
    } catch {
      setHintText('The crystal ball is cloudy... try your own wits!');
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <Starfield />
      <GoldenParticles />
      <RacingCars />
      <div className="fog-overlay" />

      <div className="w-full max-w-[600px] mx-auto relative z-10">
        <div className="glass-card">
          <div className="shimmer-border" />

          <div className="main-card-content">
            {/* Title Bar */}
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-black gold-glow">
                The Triwizard Quiz Tournament
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="racing-progress-container">
                <div className="racing-progress-fill" style={{ width: `${progress}%` }} />
                <div className="progress-car" style={{ left: `${progress}%` }}>
                  🏎
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs font-semibold" style={{ color: 'var(--sage-green)' }}>
                <span>★ Start</span>
                <span>{currentIndex + 1}/{totalQuestions}</span>
                <span>★ Finish</span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${isTimerDanger ? 'border-[var(--gryffindor-red)] bg-[rgba(196,30,58,0.1)]' : 'border-[var(--gold-border)] bg-[rgba(255,215,0,0.05)]'}`}>
                <span>⏳</span>
                <span className={`text-xl font-bold font-mono ${isTimerDanger ? 'timer-danger' : 'timer-normal'}`}>
                  {formatTime(timeLeft)}
                </span>
                {isTimerDanger && (
                  <span className="text-xs text-[var(--gryffindor-red)] font-semibold animate-pulse ml-1">
                    The spell is fading!
                  </span>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div
              ref={questionRef}
              className={`transition-all duration-500 mb-6 ${slideIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: 'rgba(20, 40, 15, 0.9)',
                  border: '1px solid var(--gold-border)',
                  position: 'relative',
                }}
              >
                {/* Gold decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[var(--magical-gold)] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[var(--magical-gold)] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[var(--magical-gold)] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[var(--magical-gold)] rounded-br-lg" />

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[var(--magical-gold)] bg-[rgba(255,215,0,0.1)] px-3 py-1 rounded-full">
                    Question {currentIndex + 1}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold leading-snug" style={{ color: 'var(--sage-green)' }}>
                  {currentQuestion.question}
                </h3>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {Object.entries(currentQuestion.options).map(([key, value], i) => {
                const isSelected = selectedAnswers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={`option-btn ${key} ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="option-key">{key}</span>
                    <span>{value}</span>
                    {isSelected && (
                      <span className="ml-auto" style={{ color: 'var(--magical-gold)' }}>✦</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hint Button */}
            <div className="text-center mb-4">
              <button
                onClick={handleHint}
                className="px-4 py-2 rounded-xl font-semibold text-sm border border-[var(--gold-border)] bg-[rgba(74,144,164,0.08)] text-[var(--ravenclaw-blue)] hover:bg-[rgba(74,144,164,0.15)] transition-all"
              >
                🔮 Consult the Crystal Ball
              </button>
              {showHint && (
                <div className="mt-3 p-3 rounded-xl border border-[rgba(74,144,164,0.4)] bg-[rgba(74,144,164,0.08)] text-sm text-left">
                  {hintLoading ? (
                    <span className="text-[var(--sage-green)]">Gazing into the crystal ball...</span>
                  ) : (
                    <span style={{ color: 'var(--ravenclaw-blue)' }}>💡 {hintText}</span>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid var(--gold-border)' }}>
              <button
                onClick={() => setCurrentIndex(prev => prev - 1)}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl font-bold text-sm border border-[var(--gold-border)] bg-[rgba(255,215,0,0.05)] text-[var(--sage-green)] hover:bg-[rgba(255,215,0,0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Wingardium
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm border border-[var(--gold-border)] bg-[rgba(255,215,0,0.1)] text-[var(--magical-gold)] hover:bg-[rgba(255,215,0,0.15)] transition-all"
                >
                  Leviosa →
                </button>
              ) : (
                <button
                  onClick={(e) => { handleRipple(e); handleSubmit(); }}
                  className="magical-btn px-5 py-2.5 text-sm"
                >
                  ⚡ Reveal the Magic
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}