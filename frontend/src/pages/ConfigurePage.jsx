import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: 'Simple', description: 'Recall-based questions testing key definitions' },
  { value: 'Medium', description: 'Application questions across all slides' },
  { value: 'Complex', description: 'Scenario and analysis questions requiring deep understanding' },
];

const SPINNER_MESSAGES = ['Reading your slides...', 'Crafting questions...', 'Almost ready...'];

export default function ConfigurePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const fileName = state.fileName || 'Unknown file';
  const slideCount = state.slideCount || 0;
  const slideContent = state.slideContent || [];

  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      setSpinnerIndex(0);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (loading) return;
    if (!slideContent.length) {
      setError('No slide content is available. Please go back and upload a presentation.');
      return;
    }

    setError('');
    setLoading(true);

    try {
     const response = await fetch('http://localhost:5001/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    numQuestions: numQuestions,
    difficulty: difficulty,
    topic: fileName || 'Cyber Security'
  }),
});

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      navigate('/quiz', {
        state: {
          questions: data,
          fileName,
          difficulty,
          questionCount,
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 sm:p-8 lg:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Configure Your Quiz</h1>
          <p className="text-sm text-slate-400">Tune the quiz length and difficulty before generating questions.</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-800/70 p-4">
          <p className="text-sm text-slate-400">Source file</p>
          <p className="mt-1 font-medium text-white">{fileName}</p>
          <p className="mt-1 text-sm text-slate-400">{slideCount} slides detected</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="question-count" className="text-sm font-medium text-slate-200">Number of Questions</label>
            <span className="text-sm font-semibold text-teal-400">{questionCount}</span>
          </div>
          <input
            id="question-count"
            type="range"
            min="5"
            max="30"
            step="1"
            value={questionCount}
            onChange={(event) => setQuestionCount(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-teal-500"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-200">Difficulty</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {DIFFICULTY_OPTIONS.map((option) => {
              const selected = difficulty === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDifficulty(option.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {option.value}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-slate-400">{DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.description}</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-800/70 px-4 py-4 text-sm text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            <span>{SPINNER_MESSAGES[spinnerIndex]}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-4 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          ⚡ Generate Quiz
        </button>
      </div>
    </div>
  );
}