import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

export default function ConfigurePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { slides, slideCount, fileName } = location.state || {};

  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  const messages = ['Reading your slides...', 'Crafting questions...', 'Almost ready...'];

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMsg(messages[i % messages.length]);
      i++;
    }, 1500);

    try {
      const slideContent = slides
        ? slides.map(s => `Slide ${s.slideNumber}: ${s.title}\n${s.content}`).join('\n\n')
        : 'Sample content about artificial intelligence and machine learning';

      const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideContent, questionCount, difficulty, fileName })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate');
      
      navigate('/quiz', { state: { questions: data.questions, fileName, difficulty } });
    } catch (err) {
      setError('Failed to generate quiz: ' + err.message);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-2xl w-full space-y-6">
        <h1 className="text-3xl font-bold text-center">Configure Your Quiz</h1>

        <div className="bg-[#1C2541] rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Source file</p>
          <p className="text-white font-medium">{fileName || 'No file'} · {slideCount || 0} slides</p>
        </div>

        <div className="bg-[#1C2541] rounded-xl p-6 border border-gray-700 space-y-4">
          <div className="flex justify-between items-center">
            <label className="font-semibold">Number of questions</label>
            <span className="text-teal-400 font-bold text-xl">{questionCount}</span>
          </div>
          <input
            type="range" min="5" max="30" value={questionCount}
            onChange={e => setQuestionCount(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>min 5</span><span>max 30</span>
          </div>
        </div>

        <div className="bg-[#1C2541] rounded-xl p-6 border border-gray-700 space-y-4">
          <label className="font-semibold">Difficulty level</label>
          <div className="grid grid-cols-3 gap-3">
            {['Simple', 'Medium', 'Complex'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-3 rounded-xl font-bold transition-all ${
                  difficulty === d
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            {difficulty === 'Simple' && 'Recall-based questions testing key definitions'}
            {difficulty === 'Medium' && 'Application questions across all slides'}
            {difficulty === 'Complex' && 'Scenario and analysis questions requiring deep understanding'}
          </p>
        </div>

        {error && <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 text-red-300">{error}</div>}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-extrabold py-4 rounded-xl text-lg transition-all"
        >
          {loading ? loadingMsg : '⚡ Generate Quiz'}
        </button>
      </div>
    </div>
  );
}
