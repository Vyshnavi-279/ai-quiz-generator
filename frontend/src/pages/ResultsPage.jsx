import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, RotateCcw, Upload, XCircle } from 'lucide-react';

export default function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};
  const questions = state.questions || [];
  const userAnswers = state.userAnswers || {};
  const fileName = state.fileName || 'Untitled presentation';
  const difficulty = state.difficulty || 'Medium';
  const questionCount = state.questionCount || questions.length || 0;

  const reviewData = useMemo(() => {
    return questions.map((question) => {
      const userAnswer = userAnswers[question.id] || userAnswers[String(question.id)] || '';
      return {
        ...question,
        userAnswer,
        isCorrect: userAnswer === question.correctAnswer,
      };
    });
  }, [questions, userAnswers]);

  const correctCount = reviewData.filter((item) => item.isCorrect).length;
  const total = reviewData.length || questionCount || 0;
  const wrongCount = total - correctCount;
  const percentage = total ? Math.round((correctCount / total) * 100) : 0;
  const scoreText = `${correctCount}/${total}`;

  const motivation = percentage >= 80 ? 'Excellent work! 🎉' : percentage >= 50 ? 'Good effort! 💪' : 'Keep practicing! 📚';

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.unshift({
      fileName,
      date: new Date().toLocaleDateString(),
      score: correctCount,
      total,
      difficulty,
      questions: reviewData,
    });
    localStorage.setItem('quizHistory', JSON.stringify(history.slice(0, 10)));
  }, [correctCount, difficulty, fileName, reviewData, total]);

  if (!questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl shadow-slate-950/50">
          <h1 className="text-2xl font-semibold">No results found</h1>
          <p className="mt-3 text-sm text-slate-400">Complete a quiz to see your score summary here.</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-2xl bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
            Start a quiz
          </button>
        </div>
      </div>
    );
  }

  const handleRetakeQuiz = () => {
    navigate('/quiz', {
      state: {
        questions,
        fileName,
        difficulty,
        questionCount,
      },
    });
  };

  const handleUploadNew = () => {
    navigate('/');
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div id="results-content" className="mx-auto flex max-w-5xl flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/50 sm:p-8 lg:p-10">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-400">Quiz complete</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Results Summary</h1>
          <p className="text-sm text-slate-400">{fileName} • {difficulty} difficulty</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-slate-800 bg-slate-800/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="relative h-44 w-44">
            <svg viewBox="0 0 200 200" className="h-44 w-44 -rotate-90">
              <circle cx="100" cy="100" r={radius} stroke="#1e293b" strokeWidth="16" fill="none" />
              <circle cx="100" cy="100" r={radius} stroke="#f59e0b" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold text-white">{scoreText}</span>
              <span className="mt-2 text-sm text-slate-400">{percentage}%</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
            <div className="rounded-full bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-400">{motivation}</div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-300">✓ {correctCount} correct</span>
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300">✗ {wrongCount} wrong</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">REVIEW & AI FEEDBACK</h2>
            <span className="text-sm text-slate-400">{total} questions</span>
          </div>

          <div className="space-y-3">
            {reviewData.map((question, index) => {
              const isCorrect = question.isCorrect;
              return (
                <div key={question.id ?? index} className={`rounded-2xl border bg-slate-800/70 p-4 ${isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isCorrect ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                      {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{question.question}</p>
                      <p className={`mt-2 text-sm ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                        {isCorrect ? `Your answer: ${question.userAnswer || 'No answer'} — correct` : `Your answer: ${question.userAnswer || 'No answer'} • Correct answer: ${question.correctAnswer}`}
                      </p>
                      {!isCorrect && (
                        <div className="mt-3 rounded-2xl border border-teal-500/30 bg-teal-500/10 p-3 text-sm text-teal-100">
                          <p className="font-medium">AI explanation</p>
                          <p className="mt-1 leading-relaxed text-teal-100/90">{question.explanation || 'Review the related content to understand the correct answer.'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <button type="button" onClick={handleRetakeQuiz} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700">
            <RotateCcw className="h-4 w-4" />
            🔄 Retake Quiz
          </button>
          <button type="button" onClick={handleUploadNew} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700">
            <Upload className="h-4 w-4" />
            📤 Upload New PPT
          </button>
          <button type="button" onClick={handleDownloadPdf} className="flex items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400">
            <Download className="h-4 w-4" />
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}