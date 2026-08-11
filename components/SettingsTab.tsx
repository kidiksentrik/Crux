'use client';

import React from 'react';
import { UserSettings } from '@/lib/types';

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const handleDailyGoal = (goal: number) => {
    onUpdateSettings({ dailyGoal: goal });
  };

  const handleTTSSpeed = (speed: number) => {
    onUpdateSettings({ ttsSpeed: speed });
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to reset all card progress and stats?')) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] p-4 max-w-lg mx-auto pb-24">
      <div className="card-glass p-6 rounded-3xl mb-6">
        <h2 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
          <span>⚙️</span> Study Settings
        </h2>
        <p className="text-xs text-gray-400">Tailor your daily Polish B1 exam prep routine.</p>
      </div>

      {/* Daily Goal Option */}
      <div className="card-glass p-6 rounded-3xl mb-4 border border-white/10">
        <h3 className="text-sm font-bold text-gray-200 mb-1">Daily Word Goal</h3>
        <p className="text-xs text-gray-400 mb-4">Choose how many B1 Pokemon cards to study each day.</p>

        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 20].map((goal) => (
            <button
              key={goal}
              onClick={() => handleDailyGoal(goal)}
              className={`py-3 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                settings.dailyGoal === goal
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 font-extrabold scale-[1.02]'
                  : 'bg-gray-900/80 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              <span className="text-base font-extrabold">{goal}</span>
              <span className="text-[10px] opacity-80">
                {goal === 5 ? 'Casual' : goal === 10 ? 'Standard' : 'Sprint'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Pronunciation Speed */}
      <div className="card-glass p-6 rounded-3xl mb-4 border border-white/10">
        <h3 className="text-sm font-bold text-gray-200 mb-1">TTS Voice Speed</h3>
        <p className="text-xs text-gray-400 mb-4">Adjust the Polish pronunciation playback speed.</p>

        <div className="grid grid-cols-3 gap-2">
          {[0.8, 1.0, 1.2].map((speed) => (
            <button
              key={speed}
              onClick={() => handleTTSSpeed(speed)}
              className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                settings.ttsSpeed === speed
                  ? 'bg-emerald-500 text-black border-emerald-400 font-extrabold scale-[1.02]'
                  : 'bg-gray-900/80 text-gray-400 border-white/10 hover:text-white'
              }`}
            >
              {speed}x {speed === 0.8 ? '(Slow)' : speed === 1.0 ? '(Normal)' : '(Fast)'}
            </button>
          ))}
        </div>
      </div>

      {/* Info & Data Management */}
      <div className="card-glass p-6 rounded-3xl mb-6 border border-white/10 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Architecture</h3>
          <p className="text-xs text-emerald-400 font-medium">100% Free & Offline-Ready (0 API / 0 DB Calls)</p>
        </div>

        <div className="pt-3 border-t border-white/10">
          <button
            onClick={handleClearData}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
          >
            Reset All Progress & Local Data
          </button>
        </div>
      </div>
    </div>
  );
}
