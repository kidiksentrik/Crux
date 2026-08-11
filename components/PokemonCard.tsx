'use client';

import React, { useState } from 'react';
import { B1Word } from '@/lib/types';

interface PokemonCardProps {
  word: B1Word;
  onSelfAssess?: (status: 'learning' | 'mastered') => void;
  ttsSpeed?: number;
}

export default function PokemonCard({ word, onSelfAssess, ttsSpeed = 1.0 }: PokemonCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return; // Only tilt front
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = -(y / (rect.height / 2)) * 12; // Max 12deg
    const rotateY = (x / (rect.width / 2)) * 12;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const speakPolish = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'pl-PL';
    utterance.rate = ttsSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const getHoloClass = (category: string) => {
    switch (category) {
      case 'Official / Administrative': return 'card-holo-official';
      case 'Grammar Connectors': return 'card-holo-grammar';
      case 'Verb Aspect Pairs': return 'card-holo-verbs';
      case 'Daily Life & Home': return 'card-holo-daily';
      case 'Work & Education': return 'card-holo-work';
      case 'Travel & City': return 'card-holo-travel';
      default: return 'card-glass';
    }
  };

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Official / Administrative': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Grammar Connectors': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Verb Aspect Pairs': return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'Daily Life & Home': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Work & Education': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Travel & City': return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40';
    }
  };

  const handleAssessment = (status: 'learning' | 'mastered', e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelfAssess) {
      onSelfAssess(status);
    }
    setIsFlipped(false);
  };

  return (
    <div 
      className="w-full max-w-sm h-[440px] perspective-1000 cursor-pointer my-4 mx-auto relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        transform: `rotateY(${tilt.y}deg) rotateX(${tilt.x}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      <div className="w-full h-full relative transition-all duration-500 ease-out">
        {/* FRONT OF CARD */}
        {!isFlipped ? (
          <div className={`w-full h-full rounded-3xl p-6 flex flex-col justify-between holo-sheen ${getHoloClass(word.category)} transition-all duration-300`}>
            {/* Card Top Banner */}
            <div className="flex justify-between items-center z-10">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getBadgeColor(word.category)} uppercase tracking-wider`}>
                {word.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">B1 EXAM</span>
            </div>

            {/* Center Main Word */}
            <div className="flex flex-col items-center justify-center my-auto py-6 z-10">
              <div className="relative">
                <h2 className="text-4xl font-extrabold text-white tracking-tight text-center drop-shadow-lg">
                  {word.word}
                </h2>
              </div>
              
              {/* Audio TTS Button */}
              <button
                onClick={speakPolish}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm text-gray-200 transition-all shadow-xl active:scale-95 z-20"
                title="Listen pronunciation"
              >
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.707 12 4.414 12 5.586v12.828c0 1.172-1.077 1.879-1.707 1.25L5.586 15z" />
                </svg>
                <span className="font-semibold">Listen Pronunciation</span>
              </button>
            </div>

            {/* Bottom Prompt */}
            <div className="text-center pt-4 border-t border-white/10 z-10">
              <p className="text-xs text-gray-400 animate-pulse font-medium">
                ✨ Tap card to flip & reveal meaning
              </p>
            </div>
          </div>
        ) : (
          /* BACK OF CARD */
          <div className={`w-full h-full rounded-3xl p-6 flex flex-col justify-between holo-sheen ${getHoloClass(word.category)} transition-all duration-300`}>
            <div className="z-10">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  CARD DETAILS
                </span>
                <span className="text-xs text-gray-400 font-mono">Lemma: {word.base_form}</span>
              </div>

              {/* Meaning EN */}
              <div className="mt-4">
                <p className="text-xs text-gray-400 uppercase font-semibold">English Meaning</p>
                <p className="text-lg font-bold text-emerald-400 leading-snug mt-1">
                  {word.meaning_en}
                </p>
              </div>

              {/* Polish B1 Example */}
              <div className="mt-4 bg-black/40 p-3.5 rounded-2xl border border-white/10">
                <p className="text-xs text-amber-400 uppercase font-semibold">Polish B1 Sentence</p>
                <p className="text-sm text-gray-100 mt-1 italic leading-relaxed font-medium">
                  &quot;{word.example_pl}&quot;
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {word.example_en}
                </p>
              </div>

              {/* Synonyms */}
              {word.synonyms && word.synonyms.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 font-semibold mb-1">Synonyms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {word.synonyms.map((syn, idx) => (
                      <span key={idx} className="text-xs bg-white/10 text-gray-200 px-2.5 py-0.5 rounded-lg border border-white/10">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Self-Assessment Action Buttons */}
            {onSelfAssess && (
              <div className="flex gap-3 pt-3 border-t border-white/10 z-20">
                <button
                  onClick={(e) => handleAssessment('learning', e)}
                  className="flex-1 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-lg shadow-red-500/10"
                >
                  <span>🔴 Forgot</span>
                </button>
                <button
                  onClick={(e) => handleAssessment('mastered', e)}
                  className="flex-1 py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-lg shadow-emerald-500/10"
                >
                  <span>🟢 Got It!</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
