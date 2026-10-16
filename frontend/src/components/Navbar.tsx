import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Newspaper, BarChart3, HelpCircle, History, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOperational, setIsOperational] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        const res = await api.getHealth();
        if (mounted) setIsOperational(res.status === 'operational' && res.model_loaded);
      } catch {
        if (mounted) setIsOperational(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analyze', label: 'Analyze News', icon: Sparkles },
    { to: '/how-it-works', label: 'How It Works', icon: HelpCircle },
    { to: '/model-info', label: 'Model Info', icon: BarChart3 },
    { to: '/history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c0d0f]/90 backdrop-blur-md border-b border-[#22262c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo / Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#16181d] border border-[#2e333b] flex items-center justify-center text-[#e5e0d8] shadow-inner group-hover:border-[#b91c1c] transition-colors">
              <Newspaper className="w-5 h-5 text-[#f4f0e6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-widest text-[#fcfaf7]">VERITAS AI</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1f2329] text-[#9ca3af] border border-[#2d323a]">
                  NLP v1.0
                </span>
              </div>
              <p className="text-[11px] font-serif italic text-[#8c929d] tracking-wide">Look Beyond the Headline</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 text-xs uppercase tracking-wider font-medium rounded-sm transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#181a1f] text-[#fcfaf7] border border-[#323842] shadow-xs'
                      : 'text-[#9ca3af] hover:text-[#f4f0e6] hover:bg-[#131518]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Model Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121417] border border-[#242930] text-xs font-mono">
              {isOperational === true && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 text-[11px]">Model Ready</span>
                </>
              )}
              {isOperational === false && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-400 text-[11px]">Offline / Training Needed</span>
                </>
              )}
              {isOperational === null && (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-500 animate-ping" />
                  <span className="text-gray-400 text-[11px]">Checking Backend...</span>
                </>
              )}
            </div>

            <Link
              to="/analyze"
              className="px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm bg-[#b91c1c] text-[#fdfbf7] hover:bg-[#991b1b] transition-all shadow-sm border border-[#dc2626]/40 flex items-center gap-1.5"
            >
              Analyze News
            </Link>
          </div>
        </div>
      </div>
      
      {/* Mobile nav strip */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 gap-2 border-t border-[#1c1f24] bg-[#0f1114]">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1 text-xs whitespace-nowrap rounded font-medium ${
                isActive ? 'bg-[#1f232b] text-[#fcfaf7]' : 'text-[#8b919d]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
