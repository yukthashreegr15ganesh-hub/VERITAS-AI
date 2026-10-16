import React, { useEffect, useState } from 'react';
import type { SampleArticle } from '../types';
import { api } from '../services/api';
import { Bookmark, ArrowRight } from 'lucide-react';

interface Props {
  onSelectSample: (headline: string, text: string) => void;
}

export const SampleArticleSelector: React.FC<Props> = ({ onSelectSample }) => {
  const [samples, setSamples] = useState<SampleArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getSampleArticles()
      .then((data) => {
        if (mounted) {
          setSamples(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || samples.length === 0) return null;

  return (
    <div className="p-4 rounded-md border border-[#272b33] bg-[#121418] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#b91c1c]" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#f0ebe1]">
            Load Illustrative Benchmark Sample
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#8b919d]">
          Click to pre-fill editor
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onSelectSample(sample.title, sample.text)}
            className="p-3 text-left rounded bg-[#171a1f] hover:bg-[#1f232a] border border-[#262a32] hover:border-[#3d4450] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8c929d] mb-1">
                <span className="truncate max-w-[130px]">{sample.category}</span>
                <span className={sample.expected_label === 'REAL' ? 'text-emerald-400' : 'text-red-400'}>
                  {sample.expected_label}
                </span>
              </div>
              <h5 className="text-xs font-serif font-medium text-[#e4dfd7] line-clamp-2 group-hover:text-[#fcfaf7]">
                {sample.title}
              </h5>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#9ca3af] group-hover:text-[#f4f0e6] pt-2">
              <span>Insert text</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
