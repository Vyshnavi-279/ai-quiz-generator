import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SetupPage() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [parseResult, setParseResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pptx')) {
      setError('Invalid file format. Please upload a .pptx file only.');
      setFile(null);
      setParseResult(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Server responded with an operational error status');
      }

      const data = await response.json();
      console.log("Success! Extracted payload:", data);
      setParseResult(data);

    } catch (err) {
      console.error("Network connection or fetch error:", err);
      setError('Failed to fetch parsing data. Ensure backend server is running on port 5001!');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!parseResult) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numQuestions: numQuestions,
          difficulty: difficulty,
          topic: file ? file.name.replace('.pptx', '') : 'Cyber Security'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute quiz generation sequence.');
      }

      const data = await response.json();
      if (data.success) {
        navigate('/quiz', { 
          state: { 
            questions: data.questions,
            topic: file ? file.name.replace('.pptx', '') : 'Cyber Security',
            difficulty: difficulty
          } 
        });
      } else {
        setError('Failed to generate quiz questions cleanly.');
      }
    } catch (err) {
      console.error("Generation pipeline failure:", err);
      setError('Could not dispatch configurations to backend engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#1C2541]/50 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">AI Quiz Generator</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Configure Your Quiz</p>
        
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-teal-400 mb-2">Source file</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center bg-[#1C2541]/30 hover:border-teal-500 transition-all">
              <input 
                type="file" 
                accept=".pptx"
                onChange={handleFileChange}
                className="hidden" 
                id="pptx-upload"
              />
              <label htmlFor="pptx-upload" className="cursor-pointer block text-sm text-gray-300">
                {file ? `📁 ${file.name}` : 'Drag & drop your .pptx here or click to browse'}
              </label>
            </div>
            {error && <p className="text-rose-400 text-xs mt-2 font-semibold">⚠️ {error}</p>}
          </div>

          {loading && (
            <div className="text-center py-2 text-sm text-amber-400 font-medium animate-pulse">
              ⏳ Processing pipeline...
            </div>
          )}

          {parseResult && (
            <div className="bg-[#0B132B]/60 border border-emerald-500/30 rounded-xl p-4">
              <div className="text-xs font-bold text-emerald-400">
                ✓ {parseResult.slideCount || 12} slides detected
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase text-teal-400">Number of Questions</label>
              <span className="text-sm font-black text-teal-300">{numQuestions}</span>
            </div>
            <input 
              type="range" min="5" max="30" 
              value={numQuestions} 
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-teal-400 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {['simple', 'medium', 'complex'].map((tier) => (
                <button
                  key={tier} type="button" onClick={() => setDifficulty(tier)}
                  className={`capitalize py-2.5 text-xs font-bold border rounded-xl transition-all ${
                    difficulty === tier ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md' : 'bg-transparent border-gray-700 text-gray-400'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!parseResult || loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 text-slate-950 disabled:text-gray-500 font-extrabold py-3.5 rounded-xl shadow-lg transition-all"
          >
            ⚡ Generate Quiz
          </button>
        </form>
      </div>
    </div>
  );
}