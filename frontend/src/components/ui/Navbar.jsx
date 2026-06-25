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
            <span className="gradient-text">QuizNebula</span>
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
                      ? 'bg-[rgba(139,92,246,0.15)] text-[var(--cosmic-purple)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[rgba(148,163,184,0.05)]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(148,163,184,0.05)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--cosmic-purple)]" />
            NEBULA MODE
          </div>
        </div>
      </div>
    </nav>
  );
}
