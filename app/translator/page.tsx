'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, Languages, HelpCircle } from 'lucide-react';

interface TranslationData {
  word: string;
  meaning: string;
  base_form?: string;
  synonyms: string[];
  search_count: number;
}

export default function TranslatorPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Settings
  const [targetLang, setTargetLang] = useState('PL');
  const [baseLang, setBaseLang] = useState('EN');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTarget = localStorage.getItem('crux_target_lang') || 'PL';
      const storedBase = localStorage.getItem('crux_base_lang') || 'EN';
      setTimeout(() => {
        setTargetLang(storedTarget);
        setBaseLang(storedBase);
      }, 0);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: cleanQuery,
          target_lang: targetLang,
          base_lang: baseLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Could not find translation. Please check the word spelling.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[#161224] pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            Translator
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#161224] text-[#F472B6] border border-[#2a2245]">
            {targetLang} → {baseLang}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] font-medium">
          Lookup any word to translate and get B1-level synonyms.
        </p>
      </div>

      {/* Search Input Card */}
      <form onSubmit={handleSearch} className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter word in ${targetLang}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B0813] border border-[#2a2245] hover:border-[#332b52] focus:border-[#A78BFA] rounded-2xl text-sm text-[#E2E8F0] placeholder-[#94A3B8] outline-none transition-all"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-[#A78BFA] hover:bg-[#b8a1fa] disabled:bg-[#251f3d] text-[#0B0813] font-bold rounded-2xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center"
          disabled={loading || !query.trim()}
        >
          {loading ? 'Translating...' : 'Search'}
        </button>
      </form>

      {/* Result Output Card */}
      {loading ? (
        /* Skeleton loading result */
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-6 space-y-5 animate-pulse shadow-xl">
          <div className="h-4 bg-[#251f3d] w-1/4 rounded-md" />
          <div className="h-8 bg-[#251f3d] w-1/2 rounded-lg" />
          <div className="h-20 bg-[#251f3d]/50 w-full rounded-2xl" />
          <div className="space-y-3 pt-2">
            <div className="h-4 bg-[#251f3d] w-1/3 rounded-md" />
            <div className="flex gap-2">
              <div className="h-9 bg-[#251f3d] w-24 rounded-full" />
              <div className="h-9 bg-[#251f3d] w-20 rounded-full" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-6 text-center text-xs text-red-400 font-medium shadow-xl">
          {error}
        </div>
      ) : result ? (
        /* Result details card */
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-6 shadow-xl flex flex-col gap-5 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#251f3d] text-[#A78BFA] tracking-wider uppercase border border-[#2a2245]">
                {targetLang}
              </span>
              <span className="text-xs text-[#94A3B8]">
                • Searched {result.search_count} {result.search_count === 1 ? 'time' : 'times'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-[#E2E8F0] tracking-tight capitalize">{result.word}</h3>
            {result.base_form && result.base_form.toLowerCase() !== result.word.toLowerCase() && (
              <p className="text-xs text-[#F472B6] font-semibold mt-1">
                Base form: <span className="underline">{result.base_form}</span>
              </p>
            )}
          </div>

          <div className="bg-[#251f3d]/40 border border-[#2a2245] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5">
              <Languages className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">Translation ({baseLang})</span>
            </div>
            <p className="text-lg font-bold text-[#E2E8F0]">{result.meaning}</p>
          </div>

          {result.synonyms && result.synonyms.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                <span className="font-semibold uppercase tracking-wider text-[10px]">B1 Synonyms ({targetLang})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.synonyms.map((syn, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-[#251f3d]/60 border border-[#2a2245] rounded-full text-xs font-semibold text-[#F472B6]"
                  >
                    {syn}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-4 shadow-xl">
          <HelpCircle className="w-8 h-8 text-[#2a2245]" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#E2E8F0]">Dictionary Empty</h3>
            <p className="text-xs text-[#94A3B8] max-w-[200px] mx-auto leading-relaxed">
              Enter any word above in {targetLang} to get instant translations and synonyms.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
