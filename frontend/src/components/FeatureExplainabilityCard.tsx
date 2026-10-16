import React from 'react';
import type { FeatureInfluence } from '../types';
import { Layers, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface Props {
  features: FeatureInfluence[];
}

export const FeatureExplainabilityCard: React.FC<Props> = ({ features }) => {
  if (!features || features.length === 0) {
    return (
      <div className="p-6 rounded-md border border-[#262a32] bg-[#121418] text-xs text-[#8c929d] font-mono">
        No high-magnitude lexical features met the statistical contribution threshold for this text.
      </div>
    );
  }

  const fakeFeatures = features.filter((f) => f.direction === 'supports_fake');
  const realFeatures = features.filter((f) => f.direction === 'supports_real');

  return (
    <div className="rounded-md border border-[#2d323b] bg-[#121418] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#262a32] bg-[#16181d] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#b91c1c]" />
          <div>
            <h3 className="text-sm font-mono uppercase font-semibold tracking-wider text-[#fcfaf7]">
              Feature Attribution & Local Interpretability
            </h3>
            <p className="text-xs font-serif italic text-[#9ca3af]">
              Lexical tokens with highest influence on the linear decision score
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#8c929d] bg-[#1e2229] px-2 py-0.5 rounded border border-[#2f3540]">
          c_i = w_i · tfidf_i
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Educational Note */}
        <div className="p-3.5 rounded bg-[#171a1f] border border-[#272b33] flex items-start gap-3 text-xs text-[#a3abb8]">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#f0ebe1]">What do these weights mean?</strong> In regularized Logistic Regression, each token's
            TF-IDF vector score is multiplied by its learned weight coefficient. Positive values push the log-odds towards
            <span className="text-red-400 font-mono"> FAKE</span>, while negative values push toward
            <span className="text-emerald-400 font-mono"> REAL</span>. These indicate statistical lexical patterns in the training data,
            <em className="text-[#f0ebe1]"> not</em> proof that an article is false or true.
          </p>
        </div>

        {/* Feature Grid: Two columns (Pushing towards Fake vs Pushing towards Real) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pushing towards FAKE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#262930]">
              <ArrowUpRight className="w-4 h-4 text-red-400" />
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-red-300">
                Tokens Associated With Fabricated Patterns ({fakeFeatures.length})
              </h4>
            </div>

            {fakeFeatures.length === 0 ? (
              <p className="text-xs font-mono text-[#6c727e] italic py-2">
                No dominant sensationalist or fabrication-associated tokens identified.
              </p>
            ) : (
              <div className="space-y-2">
                {fakeFeatures.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-[#1f1517] border border-[#401c22] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono font-semibold text-red-200 block text-xs">
                        "{f.feature}"
                      </span>
                      <span className="text-[10px] text-[#9ca3af] block">
                        {f.weight_desc}
                      </span>
                    </div>
                    <span className="font-mono text-red-400 font-bold text-xs shrink-0 pl-2">
                      +{f.contribution.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pushing towards REAL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#262930]">
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-300">
                Tokens Associated With Journalistic Patterns ({realFeatures.length})
              </h4>
            </div>

            {realFeatures.length === 0 ? (
              <p className="text-xs font-mono text-[#6c727e] italic py-2">
                No dominant mainstream journalistic tokens identified.
              </p>
            ) : (
              <div className="space-y-2">
                {realFeatures.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-[#101c18] border border-[#1b3d2f] flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono font-semibold text-emerald-200 block text-xs">
                        "{f.feature}"
                      </span>
                      <span className="text-[10px] text-[#9ca3af] block">
                        {f.weight_desc}
                      </span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold text-xs shrink-0 pl-2">
                      {f.contribution.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
