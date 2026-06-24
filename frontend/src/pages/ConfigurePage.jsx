import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DIFFICULTY_MAP = {
  Simple: { label: "Simple", desc: "Recall: basic facts and definitions" },
  Medium: { label: "Medium", desc: "Application: apply concepts to scenarios" },
  Complex: { label: "Complex", desc: "Analysis: evaluate and synthesize ideas" },
};

const SPINNER_MESSAGES = [
  "Reading slides...",
  "Crafting questions...",
  "Almost done...",
];

export default function ConfigurePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { fileName, slideCount } = location.state || {
    fileName: "Unknown file",
    slideCount: 0,
  };

  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const abortRef = useRef(null);
  const spinnerTimerRef = useRef(null);

  // Rotate spinner messages while loading
  useEffect(() => {
    if (loading) {
      spinnerTimerRef.current = setInterval(() => {
        setSpinnerIndex((prev) => (prev + 1) % SPINNER_MESSAGES.length);
      }, 3000);
    } else {
      clearInterval(spinnerTimerRef.current);
      setSpinnerIndex(0);
    }
    return () => clearInterval(spinnerTimerRef.current);
  }, [loading]);

  // Abort in-flight request if user navigates away
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    if (loading) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          slideCount,
          questionCount,
          difficulty: difficulty.toLowerCase(),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      // Navigate to quiz page with questions in state
      navigate("/quiz", {
        state: {
          questions: data.questions,
          fileName,
          difficulty,
          questionCount,
        },
      });
    } catch (err) {
      if (err.name === "AbortError") {
        // User navigated away – do nothing
        return;
      }
      console.error("Quiz generation failed:", err);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading, fileName, slideCount, questionCount, difficulty, navigate]);

  return (
    <div className="configure-page">
      <div className="configure-card">
        {/* File info */}
        <div className="file-info">
          <span className="file-icon">📄</span>
          <div>
            <p className="file-name">{fileName}</p>
            <p className="slide-count">{slideCount} slides detected</p>
          </div>
        </div>

        {/* Question count slider */}
        <div className="slider-section">
          <label className="section-label" htmlFor="question-slider">
            Number of Questions
          </label>
          <div className="slider-row">
            <input
              id="question-slider"
              type="range"
              min={5}
              max={30}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="question-slider"
            />
            <span className="slider-value">{questionCount}</span>
          </div>
        </div>

        {/* Difficulty buttons */}
        <div className="difficulty-section">
          <label className="section-label">Difficulty</label>
          <div className="difficulty-buttons">
            {Object.values(DIFFICULTY_MAP).map(({ label, desc }) => (
              <button
                key={label}
                type="button"
                className={`diff-btn ${difficulty === label ? "diff-btn--active" : ""}`}
                onClick={() => setDifficulty(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="difficulty-desc">
            {DIFFICULTY_MAP[difficulty]?.desc}
          </p>
        </div>

        {/* Generate button */}
        <button
          type="button"
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-row">
              <span className="spinner" />
              <span>{SPINNER_MESSAGES[spinnerIndex]}</span>
            </span>
          ) : (
            "⚡ Generate Quiz"
          )}
        </button>
      </div>
    </div>
  );
}