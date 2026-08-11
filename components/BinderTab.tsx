'use client';

import React, { useState } from 'react';
import { B1Word, B1Category } from '@/lib/types';
import { getStoredWordStates, getStoredStreak } from '@/lib/storage';

interface BinderTabProps {
  allWords: B1Word[];
  ttsSpeed: number;
}

export default function BinderTab({ allWords, ttsSpeed }: BinderTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWord, setSelectedWord] = useState<B1Word | null>(null);

  const wordStates = typeof window !== 'undefined' ? getStoredWordStates() : {};
  const userStreak = typeof window !== 'undefined' ? getStoredStreak() : { streak: 1, lastActiveDate: '' };

  const categories: (string | B1Category)[] = [
    'All',
    'Official / Administrative',
    'Grammar Connectors',
    'Verb Aspect Pairs',
    'Daily Life & Home',
    'Work & Education',
    'Travel & City',
  ];

  const filteredWords = allWords.filter((w) => {
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.base_form.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || w.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const masteredCount = Object.values(wordStates).filter((s) => s.status === 'mastered').length;
  const learningCount = Object.values(wordStates).filter((s) => s.status === 'learning').length;

  const speakPolish = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pl-PL';
    utterance.rate = ttsSpeed;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] p-4 max-w-2xl mx-auto pb-24">
      {/* Top Header & Stats Dashboard */}
      <div className="card-glass p-5 rounded-3xl mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📖</span> B1 Card Binder
          </h2>
          <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 text-xs font-bold">
            <span>🔥</span> {userStreak.streak} Day Streak
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 p-3 rounded-2xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Cards</p>
            <p className="text-lg font-bold text-white mt-0.5">{allWords.length}</p>
          </div>
          <div className="bg-black/30 p-3 rounded-2xl border border-emerald-500/20 text-center">
            <p className="text-[10px] text-emerald-400 uppercase font-semibold">Mastered</p>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">{masteredCount}</p>
          </div>
          <div className="bg-black/30 p-3 rounded-2xl border border-blue-500/20 text-center">
            <p className="text-[10px] text-blue-400 uppercase font-semibold">Review</p>
            <p className="text-lg font-bold text-blue-300 mt-0.5">{learningCount}</p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Polish word, English meaning, base form..."
          className="w-full pl-10 pr-4 py-3 bg-gray-900/90 border border-white/10 rounded-2xl text-sm text-gray-200 focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-gray-500"
        />
        <svg
          className="w-5 h-5 absolute left-3 top-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-gray-900/80 text-gray-400 border-white/10 hover:text-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Card Binder Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredWords.map((word) => {
          const status = wordStates[word.id]?.status || 'new';

          return (
            <div
              key={word.id}
              onClick={() => setSelectedWord(word)}
              className="card-glass p-4 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex justify-between items-start group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base group-hover:text-amber-300 transition-colors">
                    {word.word}
                  </h3>
                  <button
                    onClick={(e) => speakPolish(word.word, e)}
                    className="text-xs text-amber-400 hover:scale-110 transition-transform"
                  >
                    🔊
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{word.meaning_en}</p>
                <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                  {word.base_form}
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  status === 'mastered'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : status === 'learning'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No B1 cards found matching your search.
        </div>
      )}

      {/* Modal detail for clicked card */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="card-glass p-6 rounded-3xl max-w-sm w-full border border-amber-400/40 text-left relative">
            <button
              onClick={() => setSelectedWord(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/20 text-amber-300 inline-block mb-3">
              {selectedWord.category}
            </span>

            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold text-white">{selectedWord.word}</h2>
              <button
                onClick={(e) => speakPolish(selectedWord.word, e)}
                className="p-2 rounded-full bg-white/10 text-amber-400"
              >
                🔊
              </button>
            </div>

            <p className="text-xs text-gray-400 font-mono mt-1 mb-4">Lemma: {selectedWord.base_form}</p>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">English Meaning</p>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{selectedWord.meaning_en}</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-amber-400 uppercase font-semibold">B1 Example Sentence</p>
                <p className="text-xs text-gray-200 mt-1 italic">&quot;{selectedWord.example_pl}&quot;</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{selectedWord.example_en}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Close Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
