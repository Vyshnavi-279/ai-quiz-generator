import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    setHistory(storedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, []);

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('quizHistory');
    setHistory([]);
    setShowConfirm(false);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-[var(--success)]';
    if (percentage >= 50) return 'text-[var(--cosmic-cyan)]';
    return 'text-[var(--danger)]';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.2)] text-[var(--success)]';
      case 'medium':
        return 'bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.2)] text-[var(--cosmic-purple)]';
      case 'hard':
        return 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.2)] text-[var(--danger)]';
      default:
        return 'bg-[rgba(148,163,184,0.05)] border-[var(--border-subtle)] text-[var(--text-muted)]';
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-lg mx-auto w-full relative z-10">
          <div className="glass-card text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cosmic-purple)] to-[var(--cosmic-blue)] shadow-lg shadow-[var(--cosmic-glow)]">
                <span className="text-3xl floating">✦</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold glow-text mb-2">Quiz History</h1>
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="text-5xl opacity-30">✦</div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">No Quiz History Yet</h2>
                <p className="text-[var(--text-muted)]">
                  Your quiz attempts will appear here once you complete a quiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:py-10">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold glow-text">
                Quiz History
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {history.length} quiz attempt{history.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Clear History Button */}
            <div className="relative">
              {showConfirm ? (
                <div className="absolute right-0 top-0 bg-[var(--nebula-surface)] border border-[rgba(239,68,68,0.2)] rounded-xl p-4 min-w-[200px] shadow-xl z-10">
                  <p className="text-sm font-medium mb-3 text-[var(--text-primary)]">Clear all history?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors secondary-btn text-center"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-[rgba(239,68,68,0.15)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.25)]"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-[var(--danger)] hover:bg-[rgba(239,68,68,0.08)] transition-all text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* History Cards */}
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="glass-card p-0 overflow-hidden"
              style={{ padding: 0 }}
            >
              {/* Summary Row */}
              <button
                onClick={() => toggleExpanded(idx)}
                className="w-full p-4 flex items-center justify-between hover:bg-[rgba(148,163,184,0.03)] transition-colors text-left"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[var(--text-primary)] truncate">
                      {item.fileName || `Quiz ${item.date}`}
                    </h3>
                    {item.difficulty && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getDifficultyColor(item.difficulty)}`}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-[var(--text-muted)]">{new Date(item.date).toLocaleDateString()}</span>
                    <span className={`font-bold ${getScoreColor(item.percentage)}`}>
                      {item.score}/{item.total} ({item.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                  {expandedId === idx ? (
                    <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedId === idx && (
                <div className="border-t border-[var(--border-subtle)] p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                    Summary
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.04)] text-center">
                      <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>
                        {item.score}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Correct</p>
                    </div>
                    <div className="p-3 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-center">
                      <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>
                        {item.total - item.score}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">Wrong</p>
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