import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const slides = location.state?.slides || [];
  const fileName = location.state?.fileName || 'Presentation';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState(new Set());

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B132B] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">No Slides Available</h1>
          <p className="text-gray-400 mb-6">Upload a presentation to create flashcards.</p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold px-6 py-3 rounded-lg transition-all"
          >
            Upload Presentation
          </button>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const learnedCount = learnedCards.size;
  const progress = (learnedCount / slides.length) * 100;
  const isLearned = learnedCards.has(currentIndex);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleToggleLearned = () => {
    const newLearned = new Set(learnedCards);
    if (newLearned.has(currentIndex)) {
      newLearned.delete(currentIndex);
    } else {
      newLearned.add(currentIndex);
    }
    setLearnedCards(newLearned);
  };

  const handleResetProgress = () => {
    setLearnedCards(new Set());
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-white py-10 px-4">
      <style>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }

        @keyframes flip-back {
          0% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }

        .flashcard-container {
          perspective: 1000px;
          height: 400px;
        }

        .flashcard {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }

        .flashcard.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border-radius: 0.75rem;
          border: 1px solid rgb(55, 65, 81);
        }

        .flashcard-front {
          background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
          border-color: rgb(45, 212, 191);
        }

        .flashcard-back {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          border-color: rgb(129, 140, 248);
          transform: rotateY(180deg);
        }

        .flashcard-content {
          text-align: center;
          z-index: 1;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Flashcards
          </h1>
          <p className="text-gray-400">{fileName}</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress: {learnedCount}/{slides.length} learned</span>
            {learnedCount > 0 && (
              <button
                onClick={handleResetProgress}
                className="text-xs text-gray-500 hover:text-teal-400 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
          <div className="w-full bg-[#1C2541] h-3 rounded-full overflow-hidden border border-gray-700">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flashcard-container mx-auto max-w-2xl cursor-pointer">
          <div
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div className="flashcard-face flashcard-front">
              <div className="flashcard-content space-y-4">
                <p className="text-sm font-semibold text-teal-400 uppercase tracking-wider">Slide {currentIndex + 1}</p>
                <h2 className="text-3xl font-bold text-white leading-tight">
                  {currentSlide.title || `Slide ${currentIndex + 1}`}
                </h2>
                <p className="text-sm text-gray-300">Click to reveal content</p>
              </div>
            </div>

            {/* Back */}
            <div className="flashcard-face flashcard-back">
              <div className="flashcard-content space-y-4">
                <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Content</p>
                <p className="text-lg text-white leading-relaxed max-h-80 overflow-y-auto">
                  {currentSlide.content || 'No content available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Counter */}
        <div className="text-center text-gray-400 text-sm">
          {currentIndex + 1} of {slides.length}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-800">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1C2541] border border-gray-700 text-gray-400 hover:border-teal-500/50 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1C2541] border border-gray-700 text-gray-400 hover:border-teal-500/50 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Mark as Learned Button */}
          <button
            onClick={handleToggleLearned}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isLearned
                ? 'bg-gray-600/40 border border-gray-600 text-gray-400 hover:bg-gray-600/60'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500/50 text-white hover:opacity-90'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>{isLearned ? 'Marked as Learned' : 'Mark as Learned'}</span>
          </button>
        </div>

        {/* Learned Cards Display */}
        {learnedCount > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-green-400">✓ Learned Cards</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(learnedCards)
                .sort((a, b) => a - b)
                .map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-10 h-10 rounded-lg font-semibold flex items-center justify-center transition-all ${
                      currentIndex === idx
                        ? 'bg-green-600 text-white ring-2 ring-green-400'
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/40'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}