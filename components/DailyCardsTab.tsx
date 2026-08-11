'use client';

import React, { useState } from 'react';
import { B1Word } from '@/lib/types';
import PokemonCard from './PokemonCard';
import { updateWordStatus, recordTodayActivity } from '@/lib/storage';

interface DailyCardsTabProps {
  allWords: B1Word[];
  dailyGoal: number;
  ttsSpeed: number;
  onGoToQuiz: () => void;
}

export default function DailyCardsTab({ allWords, dailyGoal, ttsSpeed, onGoToQuiz }: DailyCardsTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [, setLearningCount] = useState(0);

  const deck = React.useMemo(() => {
    return allWords.slice(0, dailyGoal);
  }, [allWords, dailyGoal]);

  const handleSelfAssess = (status: 'learning' | 'mastered') => {
    const currentWord = deck[currentIndex];
    if (!currentWord) return;

    updateWordStatus(currentWord.id, status);
    recordTodayActivity();

    if (status === 'mastered') {
      setCompletedCount((prev) => prev + 1);
    } else {
      setLearningCount((prev) => prev + 1);
    }

    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(deck.length); // Finished!
    }
  };

  const isFinished = currentIndex >= deck.length && deck.length > 0;
  const currentWord = deck[currentIndex];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-140px)] p-4 max-w-lg mx-auto">
      {/* Top Header Progress */}
      <div className="w-full card-glass p-4 rounded-2xl mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today&apos;s Goal</span>
          <span className="text-xs font-bold text-emerald-400">
            {currentIndex} / {dailyGoal} Cards ({completedCount} Mastered)
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div 
            className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (currentIndex / dailyGoal) * 100)}%` }}
          />
        </div>
      </div>

      {/* Card Arena */}
      {!isFinished && currentWord && (
        <div className="w-full flex flex-col items-center">
          <div className="text-xs text-gray-400 font-mono mb-2">
            Card {currentIndex + 1} of {deck.length}
          </div>
          <PokemonCard 
            word={currentWord} 
            onSelfAssess={handleSelfAssess} 
            ttsSpeed={ttsSpeed} 
          />
        </div>
      )}

      {/* Finished Banner */}
      {isFinished && (
        <div className="w-full card-glass p-8 rounded-3xl text-center my-auto border border-emerald-500/30">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 text-3xl">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Daily Cards Cleared!
          </h2>
          <p className="text-sm text-gray-300 mb-6">
            You completed today&apos;s {dailyGoal} B1 words! Ready to test your mastery in Quiz Mode?
          </p>

          <button
            onClick={onGoToQuiz}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 text-sm uppercase tracking-wider"
          >
            ⚔️ Launch Quiz Battle Now
          </button>
        </div>
      )}
    </div>
  );
}
