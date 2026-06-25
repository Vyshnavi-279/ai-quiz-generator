import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Add these at the top of your component function if they are missing:
const [numQuestions, setNumQuestions] = useState(10);
const [difficulty, setDifficulty] = useState('medium');

  // 1. This function holds the upload trigger logic
  const uploadAndNavigate = async (selectedFile) => {
    if (!selectedFile) return;
    
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
const response = await fetch(`${API_BASE_URL}/api/parse`, {
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

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      console.log("Backend payload received:", data);

      if (data.success) {
        navigate('/configure', { 
          state: { 
            text: data.extractedText,
            extractedText: data.extractedText,
            slideContent: data.extractedText,
            filename: data.filename,
            fileName: data.filename,
            slideCount: data.slideCount,
            slides: data.slideCount,
            wordCount: data.wordCount
          } 
        });
      } else {
        setError('Failed to parse document structure cleanly.');
      }
    } catch (err) {
      console.error(err);
      setError('Load failed. Could not reach parsing server.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fires immediately when a file is chosen from the browse box
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pptx')) {
      setError('Invalid file format. Please upload a .pptx file only.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Automatically trigger upload logic upon file selection
    uploadAndNavigate(selectedFile);
  };
  const handleGenerate = async (e) => {
  if (e) e.preventDefault(); // Stop page from reloading
  
  try {
    // Make sure numQuestions and difficulty are read from state
    const response = await fetch(`${API_BASE_URL}/api/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numQuestions: numQuestions,
        difficulty: difficulty,
        topic: 'Cyber Security Presentation'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate quiz');
    }

    const data = await response.json();
    console.log("Quiz questions generated successfully:", data);

    if (data.success) {
      // Navigate forward to your interactive Quiz view screen
      navigate('/quiz', { 
        state: { 
          questions: data.questions,
          topic: 'Cyber Security'
        } 
      });
    }
  } catch (err) {
    console.error(err);
    alert('Failed to connect to the generator engine.');
  }
};

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-[#1C2541]/50 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">AI Quiz Generator</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Step 1: Upload Presentation Source Material</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase text-teal-400 mb-2">Upload PowerPoint (.pptx)</label>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-[#1C2541]/30 hover:border-teal-500 transition-all">
              <input 
  type="range" 
  min="5" 
  max="30" 
  value={numQuestions} 
  onChange={(e) => setNumQuestions(Number(e.target.value))} 
/>
              <label htmlFor="pptx-upload" className="cursor-pointer block text-sm text-gray-300">
                {file ? `📁 ${file.name}` : 'Drag & drop your .pptx here or click to browse files · .pptx only · max 25MB'}
              </label>
            </div>
            {error && <p className="text-rose-400 text-xs mt-3 font-semibold text-center">⚠️ {error}</p>}
          </div>

          {loading && (
            <div className="text-center py-2 text-sm text-amber-400 font-medium animate-pulse">
              ⏳ Transmitting file and generating slide structural previews...
            </div>
          )}

          {/* ⚠️ FIXED: Added explicit onClick behavior to manually fire the call as a backup trigger */}
          <button 
            type="button"
            onClick={() => uploadAndNavigate(file)}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 text-slate-950 disabled:text-gray-500 font-extrabold py-3.5 rounded-xl shadow-lg transition-all"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}