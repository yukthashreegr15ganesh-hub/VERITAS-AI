import React from 'react';
import type { PredictionResult } from '../types';
import { ShieldCheck, AlertTriangle, HelpCircle, FileText, Cpu, CheckCircle2, Search } from 'lucide-react';

interface Props {
  prediction: PredictionResult;
}

export const PredictionCard: React.FC<Props> = ({ prediction }) => {
  const isFake = prediction.raw_class === 'FAKE';
  const isReal = prediction.raw_class === 'REAL';
  const isUncertain = prediction.raw_class === 'UNCERTAIN';

  const confidencePct = Math.round(prediction.confidence_score * 1000) / 10;
  const probRealPct = Math.round(prediction.probability_real * 1000) / 10;
  const probFakePct = Math.round(prediction.probability_fake * 1000) / 10;

  return (
    <div className="rounded-md border border-[#2d323b] bg-[#121418] shadow-xl overflow-hidden">
      {/* Top Header Banner with Result Tag */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 ${
          isFake
            ? 'bg-[#240e11] border-[#5c1d24] text-[#fca5a5]'
            : isReal
            ? 'bg-[#0c1f18] border-[#1b4b39] text-[#86efac]'
            : 'bg-[#211b11] border-[#54411a] text-[#fde047]'
        }`}
      >
        <div className="flex items-center gap-3">
          {isFake && <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />}
          {isReal && <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />}
          {isUncertain && <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-80 block">Supervised Prediction</span>
            <h3 className="text-lg font-serif font-bold tracking-tight text-[#fcfaf7]">
              {prediction.predicted_label}
            </h3>
          </div>
        </div>

        {/* Model confidence badge */}
        <div className="text-right">
          <div className="text-2xl font-mono font-bold tracking-tight text-[#fcfaf7]">
            {confidencePct}%
          </div>
          <span className="text-[10px] font-mono text-[#a1a7b5] uppercase tracking-wider block">
            Estimated Posterior Probability
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Probability Breakdown Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Patterns Matching REAL Training Data: {probRealPct}%
            </span>
            <span className="text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Patterns Matching FAKE Training Data: {probFakePct}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#1b1e24] overflow-hidden flex">
            <div
              className="bg-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${probRealPct}%` }}
              title={`REAL: ${probRealPct}%`}
            />
            <div
              className="bg-red-600 transition-all duration-700 ease-out"
              style={{ width: `${probFakePct}%` }}
              title={`FAKE: ${probFakePct}%`}
            />
          </div>

          <p className="text-[11px] font-mono text-[#8b919d]">
            * Note on Confidence: Values reflect the logistic sigmoid function output P(y | x; θ) over TF-IDF n-gram vectors.
            This is a model probability estimate, not a verified probability of factual truth.
          </p>
        </div>

        {/* Article Excerpt & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2 p-4 rounded bg-[#171a1f] border border-[#262a32] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#9da3af] uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Article Analyzed</span>
            </div>
            {prediction.headline && (
              <h4 className="text-sm font-serif font-bold text-[#fcfaf7]">
                "{prediction.headline}"
              </h4>
            )}
            <p className="text-xs text-[#b8bdc7] font-serif leading-relaxed line-clamp-3 italic">
              "{prediction.article_excerpt}"
            </p>
          </div>

          <div className="p-4 rounded bg-[#171a1f] border border-[#262a32] space-y-2 text-xs font-mono text-[#9da3af]">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#9da3af]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Inference Metadata</span>
            </div>
            <div className="space-y-1 pt-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#6c727e]">Classifier:</span>
                <span className="text-[#e2ded6] truncate max-w-[120px]" title={prediction.model_name}>Logistic Regression</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c727e]">Pipeline Version:</span>
                <span className="text-[#e2ded6]">v{prediction.model_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c727e]">Word Count:</span>
                <span className="text-[#e2ded6]">{prediction.word_count.toLocaleString()} words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c727e]">Char Count:</span>
                <span className="text-[#e2ded6]">{prediction.character_count.toLocaleString()} chars</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Limitations Banner */}
        <div className="p-4 rounded bg-[#1c1815] border border-[#4a3928] text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Important Scientific Limitation</span>
          </div>
          <p className="text-[#d8cfbf] leading-relaxed">
            {prediction.limitations_disclaimer}
          </p>
        </div>

        {/* Investigative Verification Checklist */}
        <div className="p-4 rounded bg-[#15171b] border border-[#242830] space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#f0ebe1] uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-[#b91c1c]" />
            <span>Recommended Fact-Checking Steps (Independent Verification)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#9da3af]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8b919d] shrink-0 mt-0.5" />
              <span>Verify quotes directly against primary institutional transcripts.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8b919d] shrink-0 mt-0.5" />
              <span>Search international wire agencies (Reuters, AP) for corroboration.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8b919d] shrink-0 mt-0.5" />
              <span>Inspect author credentials, publishing date, and domain ownership records.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
