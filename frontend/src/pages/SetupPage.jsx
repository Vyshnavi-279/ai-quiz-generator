import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

/* ===== Sparkle Decorators ===== */
function CosmicSparkles() {
  const sparkles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    top: 5 + Math.random() * 50,
    left: -5 + Math.random() * 110,
    delay: Math.random() * 3,
  }));

  return (
    <>
      {sparkles.map(s => (
        <span
          key={s.id}
          className="sparkle-emoji"
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${1.5 + Math.random()}s`,
            pointerEvents: 'none',
            fontSize: '1.2rem',
            animation: 'sparkle-fade 2s ease-in-out infinite',
          }}
        >
          ✦
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
      setError('Only .pptx files accepted');
      return;
    }
    setError('');
    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/parse`, {
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

      const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[540px] mx-auto relative z-10">
        {/* Glass Card */}
        <div className="glass-card">
          <div className="shimmer-border" />
          <CosmicSparkles />

          <div className="main-card-content text-center">
            {/* Logo */}
            <div className="mb-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cosmic-purple)] to-[var(--cosmic-blue)] shadow-lg shadow-[var(--cosmic-glow)] mb-4">
                <span className="text-3xl floating">✦</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black glow-text mb-2">
              Generate Your Quiz
            </h1>
            <p className="text-[var(--text-secondary)] text-sm md:text-base mb-8">
              Upload your presentation to create an AI-powered quiz
            </p>

            {/* Error */}
            {error && (
              <div className="mb-6 p-3 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)]">
                <p className="text-[var(--danger)] font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && (
              <div className="space-y-6">
                <div
                  className={`upload-zone p-10 text-center transition-all ${dragOver ? 'ring-2 ring-[var(--cosmic-purple)]' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]); }}
                >
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
                      <span className="text-2xl floating">✦</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {dragOver ? 'Release to upload!' : 'Drop your file here'}
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Supports .pptx files up to 25MB
                  </p>
                  {loading && (
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--cosmic-purple)] border-t-transparent" />
                      <span className="font-semibold text-[var(--cosmic-purple)]">Processing with AI...</span>
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
                  <div className="p-4 rounded-2xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.04)]">
                    <div className="flex items-center gap-3 justify-center">
                      <span className="text-2xl" style={{ color: 'var(--success)' }}>✓</span>
                      <div>
                        <p className="text-[var(--text-primary)] font-bold">{file.name}</p>
                        <p className="text-sm" style={{ color: 'var(--success)' }}>
                          {parseResult.slideCount} slides parsed successfully
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question Count */}
                <div className="slide-up delay-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[var(--text-primary)]">Number of questions</label>
                      <span className="text-3xl font-black gradient-text">{numQuestions}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
                      <span>✦ 5</span>
                      <span>✦ 30</span>
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="slide-up delay-2">
                  <div className="space-y-3">
                    <label className="block font-bold text-[var(--text-primary)]">Difficulty level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Easy', emoji: '✦', desc: 'Basic concepts' },
                        { label: 'Medium', emoji: '✦✦', desc: 'Moderate' },
                        { label: 'Hard', emoji: '✦✦✦', desc: 'Advanced' },
                      ].map(({ label, emoji, desc }) => (
                        <button
                          key={label}
                          onClick={() => setDifficulty(label)}
                          className={`house-btn ${difficulty === label ? 'selected' : ''}`}
                        >
                          <div className="text-lg mb-1">{emoji}</div>
                          <div className="font-bold">{label}</div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</div>
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
                    className={`cosmic-btn w-full py-4 text-lg flex items-center justify-center gap-3 ${sparkling ? 'animate-pulse' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating questions...
                      </>
                    ) : (
                      <>
                        ✦ Generate Quiz
                      </>
                    )}
                  </button>
                </div>

                {/* Back */}
                <div className="slide-up delay-4">
                  <button
                    onClick={() => { setStep(1); setFile(null); setParseResult(null); }}
                    className="secondary-btn w-full"
                  >
                    ← Upload a different file
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