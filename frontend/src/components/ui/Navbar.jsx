import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Zap } from 'lucide-react';

const navLinks = [
  { path: '/', label: 'Upload' },
  { path: '/quiz', label: 'Quiz' },
  { path: '/results', label: 'Results' },
  { path: '/history', label: 'History' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-icon">
              <Zap className="w-5 h-5" />
            </span>
            <span>QuizGen</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-100 text-sky-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
            BRIGHT GUIDE
          </div>
        </div>
      </div>
    </nav>
  );
}