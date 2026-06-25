import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ===== Animated Background Components ===== */
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

/* ===== Sparkle Decorators ===== */
function SparkleDecorators() {
  const sparkles = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    top: 10 + Math.random() * 40,
    left: -10 + Math.random() * 110,
    delay: Math.random() * 3,
  }));

  return (
    <>
      {sparkles.map(s => (
        <span
          key={s.id}
          className="sparkle-emoji"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        >
          ✨
        </span>
      ))}
    </>
  );
}

/* ===== Main Component ===== */
export default function SetupPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [sparkling, setSparkling] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.pptx')) {
      setError('Only .pptx enchantments accepted');
      return;
    }
    setError('');
    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/parse', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Parse failed');
      setParseResult(data);
      setStep(2);
    } catch (err) {
      setError('Failed to parse file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSparkling(true);
    setTimeout(() => setSparkling(false), 1500);
    setError('');
    try {
      const slideContent = parseResult.slides
        ? parseResult.slides.map(s => `Slide ${s.slideNumber}: ${s.title}\n${s.content}`).join('\n\n')
        : 'Sample content';

      const response = await fetch('http://localhost:5000/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionCount: numQuestions,
          difficulty,
          slideContent,
          fileName: file.name
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');
      navigate('/quiz', { state: { questions: data.questions, fileName: file.name, difficulty } });
    } catch (err) {
      setError('Failed to generate quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const difficultyHouse = {
    'Simple': 'hufflepuff',
    'Medium': 'ravenclaw',
    'Complex': 'gryffindor',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <Starfield />
      <GoldenParticles />
      <RacingCars />
      <div className="fog-overlay" />

      <div className="w-full max-w-[600px] mx-auto relative z-10">
        {/* Glass Card */}
        <div className="glass-card">
          <div className="shimmer-border" />
          <SparkleDecorators />

          <div className="main-card-content text-center">
            {/* Logo */}
            <div className="mb-6">
              <span className="text-5xl floating-lightning">⚡</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black gold-glow mb-2">
              The Sorting Ceremony
            </h1>
            <p className="text-[var(--sage-green)] text-sm md:text-base mb-8">
              Upload your sacred scroll (PowerPoint) to begin
            </p>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-xl border border-[var(--gryffindor-red)] bg-[rgba(196,30,58,0.1)]">
                <p className="text-[var(--gryffindor-red)] font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <div className="space-y-6">
                <div
                  className={`upload-zone p-10 text-center transition-all ${dragOver ? 'ring-2 ring-[var(--magical-gold)]' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                >
                  <div className="mb-4">
                    <span className="wand-icon">✦</span>
                  </div>
                  <p className="text-lg font-bold text-[var(--magical-gold)]">
                    {dragOver ? 'Release your scroll!' : 'Drop your .pptx scroll here'}
                  </p>
                  <p className="mt-2 text-sm text-[var(--sage-green)]">
                    Only .pptx enchantments accepted · Max 25MB
                  </p>
                  {loading && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--magical-gold)] border-t-transparent" />
                      <span className="font-semibold text-[var(--magical-gold)]">Parsing with ancient magic...</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pptx" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} />
              </div>
            )}

            {/* Step 2: Configure */}
            {step === 2 && parseResult && (
              <div className="space-y-8">
                {/* Success Banner */}
                <div className="slide-up">
                  <div className="p-4 rounded-2xl border border-[rgba(92,184,92,0.3)] bg-[rgba(92,184,92,0.08)]">
                    <div className="flex items-center gap-3 justify-center">
                      <span className="text-2xl">✓</span>
                      <div>
                        <p className="text-[var(--sage-green)] font-bold">{file.name}</p>
                        <p className="text-sm" style={{ color: '#5cb85c' }}>
                          Scroll parsed! {parseResult.slideCount} slides of ancient knowledge extracted
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Count */}
                <div className="slide-up delay-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[var(--magical-gold)]">Number of questions</label>
                      <span className="text-3xl font-black" style={{ color: 'var(--gryffindor-red)' }}>{numQuestions}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-semibold text-[var(--sage-green)]">
                      <span>★ 5</span>
                      <span>★ 30</span>
                    </div>
                  </div>
                </div>

                {/* Difficulty as Houses */}
                <div className="slide-up delay-2">
                  <div className="space-y-3">
                    <label className="block font-bold text-[var(--magical-gold)]">Choose your house</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Simple', house: 'hufflepuff', emoji: '🦡' },
                        { label: 'Medium', house: 'ravenclaw', emoji: '🦅' },
                        { label: 'Complex', house: 'gryffindor', emoji: '🦁' },
                      ].map(({ label, house, emoji }) => (
                        <button
                          key={label}
                          onClick={() => setDifficulty(label)}
                          className={`house-btn ${house} ${difficulty === label ? 'selected' : ''}`}
                        >
                          <div className="text-2xl mb-1">{emoji}</div>
                          <div>{label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="slide-up delay-3">
                  <button
                    onClick={(e) => {
                      handleRipple(e);
                      handleGenerate();
                    }}
                    disabled={loading}
                    className={`magical-btn w-full py-4 text-lg flex items-center justify-center gap-3 ${sparkling ? 'animate-pulse' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--magical-gold)] border-t-transparent" />
                        Conjuring questions...
                      </>
                    ) : (
                      <>
                        ⚡ Cast the Quiz Spell
                      </>
                    )}
                  </button>
                </div>

                {/* Back */}
                <div className="slide-up delay-4">
                  <button
                    onClick={() => { setStep(1); setFile(null); setParseResult(null); }}
                    className="w-full py-3 rounded-xl border border-[var(--gold-border)] bg-transparent font-semibold text-[var(--sage-green)] transition-all hover:bg-[rgba(255,215,0,0.05)]"
                  >
                    ← Wingardium Upload-a different file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}