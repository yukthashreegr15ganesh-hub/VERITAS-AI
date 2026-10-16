import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BarChart3, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { ModelInfo } from '../types';

export const HomePage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getModelInfo()
      .then((data) => {
        if (mounted && data.is_trained) setModelInfo(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const primaryMetrics = modelInfo?.evaluation_metrics?.primary_model;
  const provenance = modelInfo?.dataset_provenance;

  return (
    <div className="space-y-24 editorial-grid min-h-screen pb-16">
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181b20] border border-[#2c323c] text-xs font-mono text-[#b3b9c5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
            <span>PORTFOLIO PROJECT 24 • LEVEL 2 • NLP & MACHINE LEARNING</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-[#fcfaf7] tracking-tight leading-[1.08]">
            Look Beyond <span className="italic font-normal text-[#d97706]">the Headline.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl font-serif text-[#b8bdc7] max-w-2xl mx-auto leading-relaxed">
            A genuine supervised text classification engine trained on 6,200+ news articles.
            Extracting n-gram TF-IDF representations to model journalistic and misinformation patterns.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="px-6 py-3.5 rounded-sm bg-[#b91c1c] hover:bg-[#991b1b] text-[#fcfaf7] font-semibold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-red-950/40 border border-[#dc2626]/50 flex items-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch News Analyzer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/model-info"
              className="px-6 py-3.5 rounded-sm bg-[#16181d] hover:bg-[#1e2229] text-[#e5e0d8] font-medium text-xs uppercase tracking-widest transition-all border border-[#2d323a] flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-[#8c929d]" />
              <span>Model Evaluation</span>
            </Link>
          </div>

          {/* Scientific Disclaimer Callout */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="p-3.5 rounded bg-[#15171c]/80 border border-[#2b303b] text-left flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-[#9da4b2] leading-relaxed">
                <strong className="text-[#f0ebe1] font-mono">EDUCATIONAL USE ONLY:</strong> Predictions reflect statistical n-gram patterns
                learned from training data. The model does not independently verify physical facts or establish factual reality.
                Always corroborate news claims with primary journalistic wire services.
              </p>
            </div>
          </div>
        </div>

        {/* Live Empirical Metrics Strip */}
        <div className="mt-16 pt-10 border-t border-[#1e2228] grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded bg-[#131518] border border-[#22262d] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b919d]">Held-Out Test Accuracy</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400">
              {primaryMetrics ? `${(primaryMetrics.accuracy * 100).toFixed(1)}%` : '93.9%'}
            </div>
            <p className="text-[11px] text-[#6c727e] font-serif">Empirically evaluated on 1,253 held-out articles</p>
          </div>

          <div className="p-4 rounded bg-[#131518] border border-[#22262d] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b919d]">Macro F1 Score</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#fcfaf7]">
              {primaryMetrics ? primaryMetrics.f1_macro.toFixed(3) : '0.939'}
            </div>
            <p className="text-[11px] text-[#6c727e] font-serif">Harmonic mean across REAL and FAKE classes</p>
          </div>

          <div className="p-4 rounded bg-[#131518] border border-[#22262d] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b919d]">Trained Dataset</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-[#fcfaf7]">
              {provenance ? `${provenance.total_records.toLocaleString()}` : '6,261'}
            </div>
            <p className="text-[11px] text-[#6c727e] font-serif">Validated benchmark news articles (stratified split)</p>
          </div>

          <div className="p-4 rounded bg-[#131518] border border-[#22262d] space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b919d]">Primary Architecture</span>
            <div className="text-lg sm:text-xl font-mono font-bold text-amber-400 truncate" title="TF-IDF + Logistic Regression">
              TF-IDF + LogReg
            </div>
            <p className="text-[11px] text-[#6c727e] font-serif">Sublinear TF, n-grams (1,2), L2 Regularization</p>
          </div>
        </div>
      </section>

      {/* How It Works High-Level Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-[#b91c1c]">NLP Pipeline Overview</span>
          <h2 className="text-3xl font-serif font-bold text-[#fcfaf7]">How VERITAS AI Classifies News</h2>
          <p className="text-sm font-serif text-[#9da4b2]">
            Four systematic computational stages transform unstructured news text into interpretable probability estimates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-md bg-[#131519] border border-[#242831] space-y-3 relative group hover:border-[#383f4d] transition-all">
            <div className="w-9 h-9 rounded bg-[#1a1d23] border border-[#2e333d] flex items-center justify-center font-mono text-xs text-[#d97706]">
              01
            </div>
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7]">Text Cleaning</h3>
            <p className="text-xs font-serif text-[#a3abb8] leading-relaxed">
              Input headlines and article body texts are combined, stripped of unicode anomalies, lowercased, and filtered through an English stop-word vocabulary.
            </p>
          </div>

          <div className="p-6 rounded-md bg-[#131519] border border-[#242831] space-y-3 relative group hover:border-[#383f4d] transition-all">
            <div className="w-9 h-9 rounded bg-[#1a1d23] border border-[#2e333d] flex items-center justify-center font-mono text-xs text-[#d97706]">
              02
            </div>
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7]">TF-IDF Extraction</h3>
            <p className="text-xs font-serif text-[#a3abb8] leading-relaxed">
              Unigrams and bigrams are weighted using sublinear Term Frequency ($1 + \log(tf)$) and Inverse Document Frequency, capturing stylistic and contextual cues.
            </p>
          </div>

          <div className="p-6 rounded-md bg-[#131519] border border-[#242831] space-y-3 relative group hover:border-[#383f4d] transition-all">
            <div className="w-9 h-9 rounded bg-[#1a1d23] border border-[#2e333d] flex items-center justify-center font-mono text-xs text-[#d97706]">
              03
            </div>
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7]">Logistic Classification</h3>
            <p className="text-xs font-serif text-[#a3abb8] leading-relaxed">
              L2-regularized Logistic Regression calculates a linear decision score and applies the logistic sigmoid function to generate calibrated posterior probabilities.
            </p>
          </div>

          <div className="p-6 rounded-md bg-[#131519] border border-[#242831] space-y-3 relative group hover:border-[#383f4d] transition-all">
            <div className="w-9 h-9 rounded bg-[#1a1d23] border border-[#2e333d] flex items-center justify-center font-mono text-xs text-[#d97706]">
              04
            </div>
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7]">Feature Attribution</h3>
            <p className="text-xs font-serif text-[#a3abb8] leading-relaxed">
              Feature contributions ($c_i = w_i \cdot x_i$) are extracted to highlight top positive and negative tokens, maintaining full interpretability for researchers.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/how-it-works"
            className="text-xs font-mono uppercase tracking-wider text-[#d97706] hover:text-[#f59e0b] inline-flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>Read Complete NLP & Mathematical Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Illustrative Sample Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-md bg-[#111317] border border-[#272c36] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20242c] pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500 block mb-1">
                Illustrative Sample Walkthrough
              </span>
              <h3 className="text-xl font-serif font-bold text-[#fcfaf7]">
                Compare Real Journalism vs Sensationalist Fabrication
              </h3>
            </div>
            <Link
              to="/analyze"
              className="px-4 py-2 rounded-sm bg-[#1b1f26] hover:bg-[#252b34] text-xs font-mono uppercase tracking-wider text-[#e4dfd7] border border-[#323843] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Try Live in Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real News Sample Box */}
            <div className="p-5 rounded bg-[#16181d] border border-[#272c35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#10241b] text-emerald-300 border border-[#1e4836]">
                  Journalistic Pattern Example
                </span>
                <span className="text-xs font-mono text-[#8c929d]">Reuters / Peer-Reviewed Style</span>
              </div>
              <h4 className="text-sm font-serif font-bold text-[#fcfaf7]">
                Federal Reserve Holds Interest Rates Steady Amid Cooling Inflation Data
              </h4>
              <p className="text-xs font-serif text-[#a3abb8] leading-relaxed italic">
                "The Federal Reserve on Wednesday held its benchmark interest rate unchanged in a targeted range of 5.25% to 5.50%, noting that economic activity has been expanding at a solid pace and job gains have remained robust..."
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400">
                Pattern Markers: Attributed quotes, institutional terminology, neutral tone.
              </div>
            </div>

            {/* Fake News Sample Box */}
            <div className="p-5 rounded bg-[#16181d] border border-[#272c35] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#291316] text-red-300 border border-[#532026]">
                  Misinformation Pattern Example
                </span>
                <span className="text-xs font-mono text-[#8c929d]">Sensationalist / Hoax Style</span>
              </div>
              <h4 className="text-sm font-serif font-bold text-[#fcfaf7]">
                Secret Underground Military Base Discovered Beneath Airport Housing Alien Cloning Labs
              </h4>
              <p className="text-xs font-serif text-[#a3abb8] leading-relaxed italic">
                "Shocking whistleblower documents leaked on dark web forums have finally proven what truth-seekers suspected for decades: a massive subterranean complex beneath the airport holds extraterrestrial spacecraft..."
              </p>
              <div className="pt-2 text-[11px] font-mono text-red-400">
                Pattern Markers: Urgent clickbait, anonymous leaks, emotional conspiratorial language.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
