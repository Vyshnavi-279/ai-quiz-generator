import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ScoreChart from '../components/analytics/ScoreChart';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state?.result;
  const reviewPayload = location.state?.reviewPayload;

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Analytics Available</h1>
          <p className="text-gray-400 mb-6">Complete a quiz to view analytics.</p>
          <button
            onClick={() => navigate('/results')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold px-6 py-3 rounded-lg transition-all"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B132B] text-white py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/results', { state: { result } })}
            className="flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Quiz Analytics
          </h1>
          <p className="text-gray-400">Detailed breakdown of your quiz performance and progress</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Score</p>
            <p className="text-4xl font-bold text-teal-400">{result.score}/{result.totalQuestions}</p>
            <p className="text-sm text-gray-500 mt-2">{result.percentage}%</p>
          </div>

          <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Correct</p>
            <p className="text-4xl font-bold text-green-400">{result.score}</p>
            <p className="text-sm text-gray-500 mt-2">{Math.round((result.score / result.totalQuestions) * 100)}% accuracy</p>
          </div>

          <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Wrong</p>
            <p className="text-4xl font-bold text-red-400">{result.totalQuestions - result.score}</p>
            <p className="text-sm text-gray-500 mt-2">{Math.round(((result.totalQuestions - result.score) / result.totalQuestions) * 100)}% incorrect</p>
          </div>

          <div className="bg-[#1C2541]/50 border border-gray-700 rounded-lg p-6">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">Date</p>
            <p className="text-xl font-bold text-cyan-400">{result.date}</p>
            <p className="text-sm text-gray-500 mt-2">Quiz taken</p>
          </div>
        </div>

        {/* Charts */}
        <ScoreChart result={result} reviewPayload={reviewPayload} />
      </div>
    </div>
  );
}
