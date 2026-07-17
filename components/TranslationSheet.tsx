'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Languages } from 'lucide-react';

interface TranslationSheetProps {
  word: string;
  context?: string;
  isOpen: boolean;
  onClose: () => void;
  targetLang: string;
  baseLang: string;
}

interface TranslationData {
  word: string;
  meaning: string;
  base_form?: string;
  synonyms: string[];
  search_count: number;
}

export default function TranslationSheet({
  word,
  context = '',
  isOpen,
  onClose,
  targetLang,
  baseLang,
}: TranslationSheetProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TranslationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !word) return;

    const fetchTranslation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            word: word.trim(),
            context: context,
            target_lang: targetLang,
            base_lang: baseLang,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to translate');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('Could not translate word.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [word, isOpen, targetLang, baseLang, context]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0813]/85 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-[#161224] border-t border-[#2a2245] rounded-t-3xl p-6 shadow-2xl transition-transform duration-300 transform translate-y-0 max-h-[80vh] overflow-y-auto animate-slide-up pb-20 md:pb-6">
        {/* Pull bar */}
        <div className="mx-auto w-12 h-1 bg-[#2a2245] rounded-full mb-5 cursor-pointer" onClick={onClose} />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#E2E8F0] p-1.5 rounded-full hover:bg-[#251f3d] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="space-y-5 animate-pulse pt-2">
            <div className="space-y-2">
              <div className="h-4 bg-[#251f3d] w-1/4 rounded-md" />
              <div className="h-8 bg-[#251f3d] w-1/2 rounded-lg" />
            </div>
            <div className="h-20 bg-[#251f3d]/50 w-full rounded-2xl" />
            <div className="space-y-3 pt-2">
              <div className="h-4 bg-[#251f3d] w-1/3 rounded-md" />
              <div className="flex gap-2">
                <div className="h-9 bg-[#251f3d] w-24 rounded-full" />
                <div className="h-9 bg-[#251f3d] w-20 rounded-full" />
                <div className="h-9 bg-[#251f3d] w-24 rounded-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 font-medium mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#251f3d] hover:bg-[#2a2245] text-[#E2E8F0] rounded-xl text-sm font-semibold transition-all border border-[#2a2245]"
            >
              Close
            </button>
          </div>
        ) : data ? (
          <div className="space-y-6 pt-1">
            {/* Header / Term */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#251f3d] text-[#A78BFA] tracking-wider uppercase border border-[#2a2245]">
                  {targetLang}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  • Searched {data.search_count} {data.search_count === 1 ? 'time' : 'times'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#E2E8F0] tracking-tight">{data.word}</h3>
              {data.base_form && data.base_form.toLowerCase() !== data.word.toLowerCase() && (
                <p className="text-xs text-[#F472B6] font-semibold mt-1">
                  Base form: <span className="underline">{data.base_form}</span>
                </p>
              )}
            </div>

            {/* Translation */}
            <div className="bg-[#251f3d]/40 border border-[#2a2245] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5">
                <Languages className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">Translation ({baseLang})</span>
              </div>
              <p className="text-lg font-bold text-[#E2E8F0]">{data.meaning}</p>
            </div>

            {/* B1-level Synonyms */}
            {data.synonyms && data.synonyms.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                  <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                  <span className="font-semibold uppercase tracking-wider text-[10px]">B1 Synonyms ({targetLang})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.synonyms.map((syn, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-[#251f3d]/60 border border-[#2a2245] hover:border-[#F472B6]/40 rounded-full text-xs font-semibold text-[#F472B6] transition-all cursor-default"
                    >
                      {syn}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
