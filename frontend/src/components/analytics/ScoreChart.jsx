import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function ScoreChart({ result, reviewPayload }) {
  const [activeChart, setActiveChart] = useState('bar');

  // Get all history from localStorage for trend
  const allHistory = useMemo(() => {
    const history = JSON.parse(localStorage.getItem('quiz_history') || '[]');
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  // Bar chart data - score breakdown by difficulty
  const difficultyData = useMemo(() => {
    const difficulties = {};

    if (reviewPayload) {
      reviewPayload.forEach((q) => {
        const difficulty = q.difficulty || 'Medium';
        if (!difficulties[difficulty]) {
          difficulties[difficulty] = { total: 0, correct: 0 };
        }
        difficulties[difficulty].total += 1;
        if (q.isCorrect) {
          difficulties[difficulty].correct += 1;
        }
      });
    }

    return Object.entries(difficulties).map(([name, data]) => ({
      name,
      correct: data.correct,
      incorrect: data.total - data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));
  }, [reviewPayload]);

  // Line chart data - score trend
  const trendData = useMemo(() => {
    return allHistory.slice(-10).map((item, idx) => ({
      attempt: `Quiz ${idx + 1}`,
      score: item.percentage,
      date: item.date,
    }));
  }, [allHistory]);

  // Pie chart data - correct vs incorrect
  const pieData = useMemo(() => {
    if (!result) return [];
    const correct = result.score;
    const incorrect = result.totalQuestions - result.score;
    return [
      { name: 'Correct', value: correct },
      { name: 'Incorrect', value: incorrect },
    ];
  }, [result]);

  // Dark mode colors
  const COLORS_PIE = ['#14b8a6', '#ef4444'];
  const COLORS_BAR = ['#10b981', '#f87171'];

  // Custom tooltip styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C2541] border border-gray-700 rounded px-3 py-2 text-sm">
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Chart Selector Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {[
          { id: 'bar', label: '📊 Score by Difficulty' },
          { id: 'line', label: '📈 Score Trend' },
          { id: 'pie', label: '🎯 Correct vs Incorrect' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
              activeChart === tab.id
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bar Chart - Score by Difficulty */}
      {activeChart === 'bar' && (
        <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Score Breakdown by Difficulty</h3>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar
                  dataKey="correct"
                  fill="#10b981"
                  name="Correct"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="incorrect"
                  fill="#f87171"
                  name="Incorrect"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              No difficulty data available
            </div>
          )}

          {/* Summary Table */}
          {difficultyData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyData.map((item) => (
                <div
                  key={item.name}
                  className="bg-black/20 border border-gray-700 rounded p-4"
                >
                  <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold text-teal-400">{item.percentage}%</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {item.correct}/{item.total} correct
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Line Chart - Score Trend */}
      {activeChart === 'line' && (
        <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Score Trend Across Quiz Attempts</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="attempt" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Score (%)"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              Insufficient history data (need multiple attempts)
            </div>
          )}

          {/* Statistics */}
          {trendData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 border border-gray-700 rounded p-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-cyan-400">
                  {Math.round(trendData.reduce((sum, d) => sum + d.score, 0) / trendData.length)}%
                </p>
              </div>

              <div className="bg-black/20 border border-gray-700 rounded p-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Best Score
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {Math.max(...trendData.map((d) => d.score))}%
                </p>
              </div>

              <div className="bg-black/20 border border-gray-700 rounded p-4">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Total Attempts
                </p>
                <p className="text-3xl font-bold text-teal-400">{allHistory.length}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pie Chart - Correct vs Incorrect */}
      {activeChart === 'pie' && (
        <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Correct vs Incorrect Distribution</h3>
          {pieData.length > 0 && pieData[0].value + pieData[1].value > 0 ? (
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                    ✓ Correct
                  </p>
                  <p className="text-3xl font-bold text-green-400">{pieData[0].value}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {result ? Math.round((result.score / result.totalQuestions) * 100) : 0}% accuracy
                  </p>
                </div>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                    ✗ Incorrect
                  </p>
                  <p className="text-3xl font-bold text-red-400">{pieData[1].value}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {result ? Math.round(((result.totalQuestions - result.score) / result.totalQuestions) * 100) : 0}% incorrect
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-400">
              No quiz data available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
