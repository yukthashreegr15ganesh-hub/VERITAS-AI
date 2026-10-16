import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#22262d] bg-[#090a0c] text-[#8e94a0]">
      {/* Editorial Disclaimer Banner */}
      <div className="border-b border-[#1b1e23] bg-[#111317]/60 py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-500/90 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold text-[#f0ebe1] uppercase tracking-wider font-mono mr-1.5">
              Scientific & Ethical Limitation:
            </span>
            VERITAS AI provides a supervised statistical machine learning prediction based on historical lexical patterns
            in its training corpus. It does not independently verify physical facts, conduct real-time investigations, or establish
            ontological truth. Predictions must never be treated as verified journalistic verdicts.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-widest text-[#fcfaf7]">VERITAS AI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1a1d22] text-[#8e94a0] border border-[#2b3038]">
                LEVEL 2 PORTFOLIO
              </span>
            </div>
            <p className="text-sm font-serif italic text-[#c5bfb4] max-w-lg">
              "Look Beyond the Headline." — Natural Language Processing system exploring supervised text classification,
              TF-IDF feature weights, and interpretability in news credibility research.
            </p>
            <p className="text-xs text-[#6c727e] pt-2">
              Designed & Engineered for CSE (Artificial Intelligence & Machine Learning).
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs uppercase font-mono font-semibold text-[#f0ebe1] tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-[#f4f0e6] transition-colors">Editorial Home</Link>
              </li>
              <li>
                <Link to="/analyze" className="hover:text-[#f4f0e6] transition-colors">News Analysis Engine</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#f4f0e6] transition-colors">How It Works (Math & NLP)</Link>
              </li>
              <li>
                <Link to="/model-info" className="hover:text-[#f4f0e6] transition-colors">Model Evaluation Metrics</Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#f4f0e6] transition-colors">Analysis History (Local SQLite)</Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 className="text-xs uppercase font-mono font-semibold text-[#f0ebe1] tracking-wider mb-3">Tech Pipeline</h4>
            <ul className="space-y-2 text-xs font-mono text-[#7b818d]">
              <li>• Scikit-learn Logistic Regression (L2)</li>
              <li>• Sublinear TF-IDF (1-2 N-grams)</li>
              <li>• Multinomial Naive Bayes Baseline</li>
              <li>• FastAPI REST Backend with Pydantic</li>
              <li>• SQLite Local Result Storage</li>
              <li>• React 19 + TypeScript + Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#181b20] flex flex-col sm:flex-row items-center justify-between text-xs text-[#5e636e] gap-4">
          <p>© {new Date().getFullYear()} VERITAS AI — Educational NLP & Machine Learning Project.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-[#7a808c]">Reproducible Open Science</span>
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#e4dfd7] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              API Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
