import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract questions array passed from the SetupPage component
  const questions = location.state?.questions || [];
  const topic = location.state?.topic || 'Cyber Security';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Fallback check if someone accesses /quiz directly without data
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">No quiz questions found. Please configure your source files first.</p>
        <button onClick={() => navigate('/')} className="bg-teal-500 text-slate-950 px-6 py-2 rounded-xl font-bold">
          Go Back to Setup
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Prevent changing answers
    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-[#1C2541]/50 border border-gray-700 rounded-2xl p-8 shadow-2xl">
        
        {!showResults ? (
          <div>
            {/* Header Status */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">🛡️ {topic}</span>
              <span className="text-sm font-black text-cyan-400">Question {currentIdx + 1} of {questions.length}</span>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-bold text-gray-100 mb-6">{currentQuestion.question}</h2>

            {/* Options List */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                let btnStyle = "border-gray-700 bg-[#1C2541]/30 hover:border-teal-500 hover:bg-teal-500/5 text-gray-300";
                
                if (selectedOption) {
                  if (option === currentQuestion.answer) {
                    btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-300"; // Correct Answer
                  } else if (option === selectedOption) {
                    btnStyle = "border-rose-500 bg-rose-500/20 text-rose-300"; // Wrong Choice
                  } else {
                    btnStyle = "border-gray-800 bg-gray-900/20 text-gray-500 opacity-60"; // Non-selected options
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!selectedOption}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-end">
              <button
                disabled={!selectedOption}
                onClick={handleNext}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 disabled:from-gray-700 disabled:to-gray-800 text-slate-950 disabled:text-gray-500 font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all"
              >
                {currentIdx + 1 === questions.length ? 'Finish Quiz 🏁' : 'Next Question →'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Dashboard view */
          <div className="text-center py-6">
            <h2 className="text-3xl font-black text-teal-400 mb-2">Quiz Completed! 🎉</h2>
            <p className="text-gray-400 text-sm mb-6">You successfully navigated the cyber challenge</p>
            
            <div className="inline-block bg-[#0B132B]/80 border border-gray-700 px-8 py-6 rounded-2xl mb-8">
              <span className="block text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Final Score</span>
              <span className="text-5xl font-black text-cyan-400">{score} <span className="text-2xl text-gray-500">/ {questions.length}</span></span>
            </div>

            <div className="block">
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
              >
                🔄 Create Another Quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}