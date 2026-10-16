import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { HistoryItem, PredictionResult } from '../types';
import { History, Trash2, ExternalLink, Shield, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { PredictionCard } from '../components/PredictionCard';
import { FeatureExplainabilityCard } from '../components/FeatureExplainabilityCard';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getHistory(50);
      setHistoryItems(data.items);
    } catch (err: any) {
      setError('Could not retrieve local analysis history from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenItem = async (id: string) => {
    try {
      const fullResult = await api.getHistoryItem(id);
      setSelectedResult(fullResult);
    } catch (err: any) {
      setError('Could not load analysis details for this record.');
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis record from your local SQLite database?')) return;
    setDeletingId(id);
    try {
      await api.deleteHistoryItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedResult && selectedResult.id === id) {
        setSelectedResult(null);
      }
    } catch (err: any) {
      setError('Failed to delete history record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to purge all analysis records from local storage? This action cannot be undone.')) return;
    try {
      await api.clearAllHistory();
      setHistoryItems([]);
      setSelectedResult(null);
    } catch (err: any) {
      setError('Failed to clear history.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#22262d] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#d97706]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#9da3af]">
              Local SQLite Analysis Records
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#fcfaf7]">
            Analysis History
          </h1>
          <p className="text-xs font-serif text-[#a3abb8]">
            Review previously analyzed articles, inspect feature attributions, or delete records.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded bg-[#201315] hover:bg-[#321a1d] text-xs font-mono uppercase tracking-wider text-red-300 border border-[#521c23] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {/* Local Storage & Privacy Notice */}
      <div className="p-4 rounded bg-[#13161b] border border-[#232933] flex items-start gap-3 text-xs text-[#a3abb8]">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono uppercase font-semibold text-[#f0ebe1] text-[11px]">
            Privacy & Local Persistence Notice:
          </span>
          <p className="leading-relaxed">
            All submitted articles and prediction results are saved strictly inside a local embedded SQLite database
            (<code className="font-mono text-[#d97706]">artifacts/veritas_history.db</code>) on your machine.
            No news texts are ever uploaded to cloud platforms, telemetry servers, or external third-party services.
            You maintain complete control to inspect or permanently delete records at any time.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded bg-[#231215] border border-[#521c23] flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#d97706] mx-auto" />
          <p className="text-xs font-mono text-[#8c929d]">Loading local history entries...</p>
        </div>
      ) : historyItems.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded border border-dashed border-[#292d36] p-8">
          <FileText className="w-8 h-8 text-[#5a606d] mx-auto" />
          <h3 className="text-base font-serif font-semibold text-[#fcfaf7]">No Analysis Records Found</h3>
          <p className="text-xs font-serif text-[#8c929d] max-w-sm mx-auto">
            You haven't analyzed any articles yet. Submit a news story in the Analysis Studio to see it archived here.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="px-5 py-2.5 rounded bg-[#b91c1c] text-xs font-mono uppercase text-[#fcfaf7] font-semibold hover:bg-[#991b1b] transition-colors"
          >
            Go to Analysis Studio
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {historyItems.map((item) => {
              const isFake = item.raw_class === 'FAKE';
              const isReal = item.raw_class === 'REAL';
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item.id)}
                  className="p-4 rounded bg-[#131519] hover:bg-[#181c22] border border-[#242831] hover:border-[#383f4e] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFake
                            ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                            : isReal
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        }`}
                      >
                        {item.predicted_label}
                      </span>
                      <span className="text-[#8c929d]">
                        Confidence: {(item.confidence_score * 100).toFixed(1)}%
                      </span>
                      <span className="text-[#6c727e]">•</span>
                      <span className="text-[#8c929d]">{item.word_count} words</span>
                      <span className="text-[#6c727e]">•</span>
                      <span className="text-[#6c727e]">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-[#fcfaf7] group-hover:text-amber-300 transition-colors truncate">
                      {item.headline || 'Untitled Article'}
                    </h4>

                    <p className="text-xs text-[#9da4b2] font-serif line-clamp-1 italic">
                      "{item.article_excerpt}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded hover:bg-[#281619] text-[#7a818e] hover:text-red-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono text-[#7a818e] group-hover:text-[#fcfaf7] flex items-center gap-1">
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Result Inspection Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full bg-[#121418] border border-[#2d323b] rounded-lg shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#242831] pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#9da3af]">
                Archived Analysis Record
              </span>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-xs font-mono text-[#8c929d] hover:text-[#fcfaf7] px-2 py-1 rounded bg-[#1e2229]"
              >
                Close (ESC)
              </button>
            </div>

            <PredictionCard prediction={selectedResult} />

            <FeatureExplainabilityCard features={selectedResult.top_features} />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigate('/analyze', { state: { selectedResult } });
                }}
                className="px-4 py-2 rounded bg-[#b91c1c] text-xs font-mono uppercase text-[#fcfaf7] font-semibold hover:bg-[#991b1b] transition-colors"
              >
                Reopen in Editor
              </button>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 rounded bg-[#1a1d23] text-xs font-mono uppercase text-[#9ca3af] hover:text-[#fcfaf7] border border-[#2a2f38] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
