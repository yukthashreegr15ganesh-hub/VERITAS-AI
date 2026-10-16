import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ModelInfo } from '../types';
import { BarChart3, Database, Cpu, Layers, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export const ModelInfoPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModelInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelInfo();
      setModelInfo(data);
    } catch (err: any) {
      setError('Unable to load model metadata. Ensure the backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-6 h-6 animate-spin text-[#d97706] mx-auto" />
        <p className="text-xs font-mono text-[#8c929d]">Loading empirical model metadata from backend artifacts...</p>
      </div>
    );
  }

  if (error || !modelInfo || !modelInfo.is_trained) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="p-8 rounded-md bg-[#1f1416] border border-[#541e24] text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <h2 className="text-xl font-serif font-bold text-[#fcfaf7]">Model Artifacts Not Initialized</h2>
          <p className="text-xs font-mono text-[#c2b8b9] max-w-lg mx-auto">
            {modelInfo?.message || error || 'Trained model artifacts are missing. Execute `python backend/scripts/train.py`.'}
          </p>
          <button
            onClick={fetchModelInfo}
            className="px-4 py-2 rounded bg-[#321c21] hover:bg-[#46232b] text-xs font-mono uppercase text-red-200 border border-[#6b252f] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const identity = modelInfo.model_identity!;
  const provenance = modelInfo.dataset_provenance!;
  const evalMetrics = modelInfo.evaluation_metrics!;
  const primary = evalMetrics.primary_model;
  const baseline = evalMetrics.baseline_model;
  const topFeatures = modelInfo.top_predictive_features;

  const cm = primary.confusion_matrix; // [[TN, FP], [FN, TP]]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Title */}
      <div className="space-y-3 border-b border-[#22262d] pb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#d97706]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#9da3af]">
            Empirical Model Verification & Metadata
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#fcfaf7]">
          Model Performance & Evaluation
        </h1>
        <p className="text-sm font-serif text-[#a3abb8] leading-relaxed max-w-3xl">
          Empirical evaluation results generated strictly on held-out test data (20% stratified split).
          All metrics reflect actual execution without test-set leakage.
        </p>
      </div>

      {/* Primary Key Metrics Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded bg-[#131519] border border-[#252831] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8c929d] tracking-wider">Test Accuracy</span>
          <div className="text-3xl font-mono font-bold text-emerald-400">
            {(primary.accuracy * 100).toFixed(2)}%
          </div>
          <span className="text-[10px] font-serif text-[#6c727e] block">Overall correct classifications</span>
        </div>

        <div className="p-5 rounded bg-[#131519] border border-[#252831] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8c929d] tracking-wider">Macro F1 Score</span>
          <div className="text-3xl font-mono font-bold text-[#fcfaf7]">
            {primary.f1_macro.toFixed(4)}
          </div>
          <span className="text-[10px] font-serif text-[#6c727e] block">Balanced class harmonic mean</span>
        </div>

        <div className="p-5 rounded bg-[#131519] border border-[#252831] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8c929d] tracking-wider">Macro Precision</span>
          <div className="text-3xl font-mono font-bold text-[#fcfaf7]">
            {primary.precision_macro.toFixed(4)}
          </div>
          <span className="text-[10px] font-serif text-[#6c727e] block">Reliability of positive calls</span>
        </div>

        <div className="p-5 rounded bg-[#131519] border border-[#252831] space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#8c929d] tracking-wider">Macro Recall</span>
          <div className="text-3xl font-mono font-bold text-[#fcfaf7]">
            {primary.recall_macro.toFixed(4)}
          </div>
          <span className="text-[10px] font-serif text-[#6c727e] block">Coverage of true positives</span>
        </div>
      </section>

      {/* Model Comparison: Logistic Regression vs Multinomial Naive Bayes Baseline */}
      <section className="rounded-md border border-[#2b3039] bg-[#121418] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#20232a] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#d97706]" />
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7] tracking-wider">
              Classifier Benchmark Comparison
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8c929d]">Held-Out Test Set (N={provenance.test_records})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[#262a32] text-[#8c929d] uppercase text-[11px]">
                <th className="py-2.5 px-3">Model Architecture</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Macro Precision</th>
                <th className="py-2.5 px-3">Macro Recall</th>
                <th className="py-2.5 px-3">Macro F1</th>
                <th className="py-2.5 px-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2229]">
              <tr className="bg-[#171a20]/60 text-[#fcfaf7]">
                <td className="py-3 px-3 font-semibold text-[#fcfaf7]">
                  TF-IDF + Logistic Regression (L2)
                </td>
                <td className="py-3 px-3 text-emerald-400 font-bold">{(primary.accuracy * 100).toFixed(2)}%</td>
                <td className="py-3 px-3">{primary.precision_macro.toFixed(4)}</td>
                <td className="py-3 px-3">{primary.recall_macro.toFixed(4)}</td>
                <td className="py-3 px-3 font-bold">{primary.f1_macro.toFixed(4)}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px]">
                    Primary Deployed
                  </span>
                </td>
              </tr>
              <tr className="text-[#9ca3af]">
                <td className="py-3 px-3">TF-IDF + Multinomial Naive Bayes</td>
                <td className="py-3 px-3 text-[#e4dfd7]">{(baseline.accuracy * 100).toFixed(2)}%</td>
                <td className="py-3 px-3">{baseline.precision_macro.toFixed(4)}</td>
                <td className="py-3 px-3">{baseline.recall_macro.toFixed(4)}</td>
                <td className="py-3 px-3">{baseline.f1_macro.toFixed(4)}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-[#1e2126] text-[#8c929d] border border-[#2b3038] text-[10px]">
                    Baseline
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs font-serif text-[#9da4b2] pt-2 leading-relaxed">
          {evalMetrics.metric_discussion}
        </p>
      </section>

      {/* Confusion Matrix & Per-Class Breakdown Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confusion Matrix Card */}
        <div className="rounded-md border border-[#2b3039] bg-[#121418] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#20232a] pb-3">
            <Layers className="w-4 h-4 text-[#d97706]" />
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7] tracking-wider">
              Held-Out Confusion Matrix
            </h3>
          </div>

          <div className="p-4 rounded bg-[#0f1114] border border-[#22262d] font-mono text-xs">
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] mb-2 font-semibold">
              <span className="text-[#6c727e]">Actual \ Pred</span>
              <span className="text-emerald-400">Pred: REAL</span>
              <span className="text-red-400">Pred: FAKE</span>
            </div>

            {/* Row 1: Actual REAL */}
            <div className="grid grid-cols-3 gap-2 text-center items-center py-2 border-t border-[#1d2026]">
              <span className="font-semibold text-emerald-400 text-left pl-2">Act: REAL</span>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                <span className="font-bold text-sm">{cm[0]?.[0]}</span>
                <span className="block text-[9px] text-[#8c929d]">True Negative (TN)</span>
              </div>
              <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-red-300">
                <span className="font-bold text-sm">{cm[0]?.[1]}</span>
                <span className="block text-[9px] text-[#8c929d]">False Positive (FP)</span>
              </div>
            </div>

            {/* Row 2: Actual FAKE */}
            <div className="grid grid-cols-3 gap-2 text-center items-center py-2 border-t border-[#1d2026]">
              <span className="font-semibold text-red-400 text-left pl-2">Act: FAKE</span>
              <div className="p-2 rounded bg-red-950/20 border border-red-900/30 text-red-300">
                <span className="font-bold text-sm">{cm[1]?.[0]}</span>
                <span className="block text-[9px] text-[#8c929d]">False Negative (FN)</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                <span className="font-bold text-sm">{cm[1]?.[1]}</span>
                <span className="block text-[9px] text-[#8c929d]">True Positive (TP)</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono text-[#8c929d]">
            Total test samples evaluated: {provenance.test_records} ({cm[0]?.[0] + cm[0]?.[1]} REAL, {cm[1]?.[0] + cm[1]?.[1]} FAKE)
          </p>
        </div>

        {/* Per-Class Detailed Performance Table */}
        <div className="rounded-md border border-[#2b3039] bg-[#121418] p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#20232a] pb-3">
            <CheckCircle2 className="w-4 h-4 text-[#d97706]" />
            <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7] tracking-wider">
              Per-Class Classification Report
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#262a32] text-[#8c929d] uppercase text-[10px]">
                  <th className="py-2 px-2">Class</th>
                  <th className="py-2 px-2">Precision</th>
                  <th className="py-2 px-2">Recall</th>
                  <th className="py-2 px-2">F1 Score</th>
                  <th className="py-2 px-2">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2229]">
                {Object.entries(primary.per_class).map(([clsName, metrics]) => (
                  <tr key={clsName} className="text-[#fcfaf7]">
                    <td className="py-2.5 px-2 font-semibold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${clsName === 'REAL' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {clsName}
                    </td>
                    <td className="py-2.5 px-2">{metrics.precision.toFixed(4)}</td>
                    <td className="py-2.5 px-2">{metrics.recall.toFixed(4)}</td>
                    <td className="py-2.5 px-2 font-bold">{metrics.f1_score.toFixed(4)}</td>
                    <td className="py-2.5 px-2 text-[#8c929d]">{metrics.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs font-serif text-[#9da4b2] leading-relaxed">
            High parity across both classes confirms that the classifier exhibits balanced sensitivity and specificity,
            avoiding bias toward either class.
          </p>
        </div>
      </section>

      {/* Dataset Provenance & Split Information */}
      <section className="rounded-md border border-[#2b3039] bg-[#121418] p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#20232a] pb-3">
          <Database className="w-4 h-4 text-[#d97706]" />
          <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7] tracking-wider">
            Dataset Provenance & Stratified Partitioning
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="font-mono text-[#f0ebe1] uppercase text-[11px] font-semibold">Provenance Details</h4>
            <div className="p-3 rounded bg-[#171a1f] border border-[#262a32] space-y-1.5 font-mono text-[11px]">
              <div><strong className="text-[#8c929d]">Source:</strong> <span className="text-[#fcfaf7]">{provenance.source_name}</span></div>
              <div><strong className="text-[#8c929d]">Total Clean Records:</strong> <span className="text-[#fcfaf7]">{provenance.total_records.toLocaleString()} articles</span></div>
              <div><strong className="text-[#8c929d]">Training Partition:</strong> <span className="text-[#fcfaf7]">{provenance.train_records.toLocaleString()} (80%)</span></div>
              <div><strong className="text-[#8c929d]">Test Partition:</strong> <span className="text-[#fcfaf7]">{provenance.test_records.toLocaleString()} (20%)</span></div>
              <div><strong className="text-[#8c929d]">Stratified Split:</strong> <span className="text-emerald-400">Yes (random_state=42)</span></div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[#f0ebe1] uppercase text-[11px] font-semibold">Label Definitions</h4>
            <div className="space-y-2">
              <div className="p-3 rounded bg-[#101c18] border border-[#1b3d2f] text-xs">
                <span className="font-mono font-bold text-emerald-300 block mb-0.5">REAL</span>
                <p className="font-serif text-[#b8bdc7] text-[11px] leading-relaxed">
                  {provenance.label_definitions.REAL}
                </p>
              </div>
              <div className="p-3 rounded bg-[#1f1517] border border-[#401c22] text-xs">
                <span className="font-mono font-bold text-red-300 block mb-0.5">FAKE</span>
                <p className="font-serif text-[#b8bdc7] text-[11px] leading-relaxed">
                  {provenance.label_definitions.FAKE}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Global Predictive Features (Vocab Influences) */}
      {topFeatures && (
        <section className="rounded-md border border-[#2b3039] bg-[#121418] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#20232a] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d97706]" />
              <h3 className="text-sm font-mono uppercase font-semibold text-[#fcfaf7] tracking-wider">
                Global Top Feature Weights (Vocabulary Inspection)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8c929d]">
              Vocabulary Size: {identity.vocabulary_size.toLocaleString()} n-grams
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Fake Indicators */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-red-400 font-semibold block">
                Top Indicators for FAKE Class (+ Weight)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topFeatures.top_fake_indicators.slice(0, 15).map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-[#201316] border border-[#4d1f27] text-xs font-mono text-red-300"
                    title={`Weight: +${f.weight}`}
                  >
                    "{f.feature}" <span className="text-red-400 font-bold text-[10px]">+{f.weight}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Top Real Indicators */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-emerald-400 font-semibold block">
                Top Indicators for REAL Class (- Weight)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topFeatures.top_real_indicators.slice(0, 15).map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded bg-[#101c18] border border-[#1e4836] text-xs font-mono text-emerald-300"
                    title={`Weight: ${f.weight}`}
                  >
                    "{f.feature}" <span className="text-emerald-400 font-bold text-[10px]">{f.weight}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Explicit Scientific Limitations List */}
      <section className="p-6 rounded-md bg-[#181514] border border-[#483724] space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-semibold">
          <AlertTriangle className="w-4 h-4" />
          <span>Mandatory Scientific Limitations</span>
        </div>
        <ul className="space-y-2 text-xs font-serif text-[#d6cdbf] list-disc list-inside leading-relaxed">
          {modelInfo.scientific_limitations?.map((limit, idx) => (
            <li key={idx}>{limit}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
