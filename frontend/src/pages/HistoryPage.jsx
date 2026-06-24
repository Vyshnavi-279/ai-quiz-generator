import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    setHistory(storedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('quiz_history');
    setHistory([]);
    setShowConfirm(false);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 50) return 'text-blue-400';
    return 'text-red-400';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/10 border-green-500/30 text-green-300';
      case 'medium':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
      case 'hard':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-300';
    }
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Quiz History
          </h1>

          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="text-6xl">📋</div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">No Quiz History Yet</h2>
              <p className="text-gray-400">
                Your quiz attempts will appear here once you complete a quiz.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Quiz History
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {history.length} quiz attempt{history.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Clear History Button */}
          <div className="relative">
            {showConfirm ? (
              <div className="absolute right-0 top-0 bg-[#1C2541] border border-red-500/30 rounded-lg p-4 min-w-xs shadow-lg z-10">
                <p className="text-sm font-medium mb-3">Clear all history?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center space-x-2 bg-[#1C2541] hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-lg transition-all text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* History Cards */}
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-[#1C2541]/50 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all"
            >
              {/* Summary Row */}
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white truncate">
                      {item.fileName || `Quiz ${item.date}`}
                    </h3>
                    {item.difficulty && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded border ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">{item.date}</span>
                    <span className={`font-bold ${getScoreColor(item.percentage)}`}>
                      {item.score}/{item.totalQuestions} ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                  {expandedId === item.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === item.id && item.reviewPayload && (
                <div className="border-t border-gray-700 bg-black/20 p-4 space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                    Question Breakdown
                  </h4>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {item.reviewPayload.map((q, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border text-sm ${
                          q.isCorrect
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            q.isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}>
                            {q.isCorrect ? '✓' : '✗'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white break-words text-xs md:text-sm">
                              {q.question}
                            </p>
                            <div className="mt-1 space-y-1 text-xs">
                              <p className="text-gray-300">
                                <span className="font-semibold">Your answer:</span> {q.options[q.userAnswer] || 'Not answered'}
                              </p>
                              {!q.isCorrect && (
                                <p className={q.isCorrect ? 'text-green-300' : 'text-blue-300'}>
                                  <span className="font-semibold">Correct:</span> {q.options[q.correctAnswer]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-700">
                    <div className="bg-green-500/10 border border-green-500/30 rounded p-2 text-center">
                      <p className="text-lg font-bold text-green-400">
                        {item.reviewPayload.filter(q => q.isCorrect).length}
                      </p>
                      <p className="text-xs text-gray-300">Correct</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-center">
                      <p className="text-lg font-bold text-red-400">
                        {item.reviewPayload.filter(q => !q.isCorrect).length}
                      </p>
                      <p className="text-xs text-gray-300">Wrong</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}