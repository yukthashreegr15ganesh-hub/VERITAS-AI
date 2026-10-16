import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import type { PredictionResult } from '../types';
import { PredictionCard } from '../components/PredictionCard';
import { FeatureExplainabilityCard } from '../components/FeatureExplainabilityCard';
import { SampleArticleSelector } from '../components/SampleArticleSelector';
import { Sparkles, Trash2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export const AnalyzePage: React.FC = () => {
  const location = useLocation();
  const [headline, setHeadline] = useState('');
  const [articleText, setArticleText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // If navigated from history with state
  useEffect(() => {
    if (location.state && (location.state as any).selectedResult) {
      setPrediction((location.state as any).selectedResult);
      if ((location.state as any).selectedResult.headline) {
        setHeadline((location.state as any).selectedResult.headline);
      }
    }
  }, [location.state]);

  const charCount = articleText.length;
  const wordCount = articleText.trim() ? articleText.trim().split(/\s+/).length : 0;
  const isInputValid = charCount >= 20 && charCount <= 50000;

  const handleSelectSample = (sampleHeadline: string, sampleText: string) => {
    setHeadline(sampleHeadline);
    setArticleText(sampleText);
    setError(null);
    setPrediction(null);
  };

  const handleClear = () => {
    setHeadline('');
    setArticleText('');
    setError(null);
    setPrediction(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!articleText.trim()) {
      setError('Please provide news article body text before submitting.');
      return;
    }
    if (charCount < 20) {
      setError('Article text must contain at least 20 characters to extract meaningful n-grams.');
      return;
    }
    if (charCount > 50000) {
      setError('Article text exceeds the maximum 50,000 character limit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.analyzeNews(headline, articleText);
      setPrediction(result);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to connect to the VERITAS AI backend service. Please verify the API is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Intro */}
      <div className="space-y-2 border-b border-[#22262d] pb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#b91c1c]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#9da3af]">
            Supervised NLP Inference Engine
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#fcfaf7]">
          News Text Analysis Studio
        </h1>
        <p className="text-sm font-serif text-[#a3abb8] max-w-3xl leading-relaxed">
          Submit a news headline and body text to generate supervised statistical classifications,
          posterior probability estimates, and TF-IDF feature attributions.
        </p>
      </div>

      {/* Illustrative Sample Quick Selector */}
      <SampleArticleSelector onSelectSample={handleSelectSample} />

      {/* Analysis Input Form */}
      <div className="rounded-md border border-[#2d323b] bg-[#121418] p-6 shadow-xl space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-5">
          {/* Headline Input (Optional) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-[#9da3af]">
              <label htmlFor="headline-input" className="uppercase tracking-wider font-semibold">
                Headline / Title <span className="text-[#6c727e] font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-[#6c727e]">{headline.length} / 500</span>
            </div>
            <input
              id="headline-input"
              type="text"
              maxLength={500}
              placeholder="e.g. Federal Reserve Holds Benchmark Interest Rate Steady..."
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded bg-[#171a20] border border-[#2a2f38] text-sm text-[#fcfaf7] placeholder-[#5a606d] focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] font-serif transition-colors"
            />
          </div>

          {/* Article Text Area (Required) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-[#9da3af]">
              <label htmlFor="article-input" className="uppercase tracking-wider font-semibold">
                Complete Article Body <span className="text-red-400 font-bold">*</span>
              </label>
              <div className="flex items-center gap-3 text-[11px] text-[#7b818d]">
                <span>{wordCount.toLocaleString()} words</span>
                <span>•</span>
                <span className={charCount > 50000 ? 'text-red-400 font-bold' : ''}>
                  {charCount.toLocaleString()} / 50,000 chars
                </span>
              </div>
            </div>
            <textarea
              id="article-input"
              rows={9}
              required
              minLength={20}
              maxLength={50000}
              placeholder="Paste the full text of the news article here for supervised classification..."
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              className="w-full px-4 py-3 rounded bg-[#171a20] border border-[#2a2f38] text-sm text-[#fcfaf7] placeholder-[#5a606d] focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c] font-serif leading-relaxed transition-colors resize-y"
            />
            {charCount > 0 && charCount < 20 && (
              <p className="text-[11px] font-mono text-amber-400">
                Minimum 20 characters required ({20 - charCount} more needed).
              </p>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#22262d]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={loading || (!headline && !articleText)}
                className="px-3.5 py-2 rounded bg-[#17191e] hover:bg-[#20232a] text-xs font-mono uppercase tracking-wider text-[#9da3af] hover:text-[#fcfaf7] border border-[#292e37] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !isInputValid}
                className="px-6 py-2.5 rounded-sm bg-[#b91c1c] hover:bg-[#991b1b] text-xs font-mono uppercase tracking-widest font-semibold text-[#fcfaf7] border border-[#dc2626]/40 shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Computing TF-IDF...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Model Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded bg-[#231215] border border-[#521c23] flex items-start gap-3 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-mono uppercase font-semibold text-red-300">Analysis Error</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {prediction && (
        <section className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#22262e] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#f0ebe1]">
                Empirical Classification Output
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#8b919d]">
              Saved to local SQLite history
            </span>
          </div>

          {/* Primary Result Card */}
          <PredictionCard prediction={prediction} />

          {/* Explainability / Feature Attribution Card */}
          <FeatureExplainabilityCard features={prediction.top_features} />
        </section>
      )}
    </div>
  );
};
