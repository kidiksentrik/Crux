'use client';

import React, { useState } from 'react';
import { UserSettings } from '@/lib/types';
import { exportUserDataCode, importUserDataCode } from '@/lib/storage';

interface SettingsTabProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export default function SettingsTab({ settings, onUpdateSettings }: SettingsTabProps) {
  const [syncCode, setSyncCode] = useState<string>('');
  const [importCodeInput, setImportCodeInput] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const handleDailyGoal = (goal: number) => {
    onUpdateSettings({ dailyGoal: goal });
  };

  const handleTTSSpeed = (speed: number) => {
    onUpdateSettings({ ttsSpeed: speed });
  };

  const handleGenerateSyncCode = () => {
    const code = exportUserDataCode();
    setSyncCode(code);

    if (navigator.clipboard && code) {
      navigator.clipboard.writeText(code);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 3000);
    }
  };

  const handleImportSyncCode = () => {
    setSyncError(false);
    setSyncSuccess(false);

    if (!importCodeInput.trim()) return;

    const success = importUserDataCode(importCodeInput);
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 1000);
    } else {
      setSyncError(true);
    }
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
    <div className="flex flex-col min-h-[calc(100vh-140px)] p-4 max-w-lg mx-auto pb-24 space-y-4">
      <div className="card-glass p-6 rounded-3xl">
        <h2 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
          <span>⚙️</span> Study Settings
        </h2>
        <p className="text-xs text-gray-400">Tailor your daily Polish B1 exam prep routine & sync progress.</p>
      </div>

      {/* Daily Goal Option */}
      <div className="card-glass p-6 rounded-3xl border border-white/10">
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
      <div className="card-glass p-6 rounded-3xl border border-white/10">
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

      {/* Cross-Device Data Sync Code (Bidirectional PC <-> Mobile) */}
      <div className="card-glass p-6 rounded-3xl border border-blue-500/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📱⚡💻</span>
          <h3 className="text-sm font-bold text-white">Cross-Device Data Sync</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Transfer your progress (Cards Mastered, Daily Goal & Streak 🔥) bidirectionally between Mobile and PC without a database!
        </p>

        {/* Export Section */}
        <div className="mb-4 pb-4 border-b border-white/10 space-y-2">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 1: Export Progress (Send)</p>
          <button
            onClick={handleGenerateSyncCode}
            className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2"
          >
            <span>📋 Generate & Copy Sync Code</span>
          </button>

          {copiedMessage && (
            <p className="text-[11px] text-emerald-400 font-bold text-center">
              ✓ Sync code copied to clipboard! Paste it on your other device.
            </p>
          )}

          {syncCode && (
            <div className="mt-2">
              <textarea
                readOnly
                value={syncCode}
                rows={2}
                className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-[11px] font-mono text-gray-300 select-all focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2: Import Progress (Receive)</p>
          <input
            type="text"
            value={importCodeInput}
            onChange={(e) => setImportCodeInput(e.target.value)}
            placeholder="Paste Sync Code here..."
            className="w-full p-3 bg-gray-900 border border-white/10 rounded-xl text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={handleImportSyncCode}
            className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2"
          >
            <span>🔄 Sync & Restore Progress</span>
          </button>

          {syncSuccess && (
            <p className="text-[11px] text-emerald-400 font-bold text-center">
              🎉 Progress synced successfully! Reloading...
            </p>
          )}
          {syncError && (
            <p className="text-[11px] text-red-400 font-bold text-center">
              ✕ Invalid Sync Code. Please check the copied code.
            </p>
          )}
        </div>
      </div>

      {/* Data Reset */}
      <div className="card-glass p-6 rounded-3xl border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Architecture</h3>
            <p className="text-xs text-emerald-400 font-medium">100% Free & Offline-Ready (0 API / 0 DB Calls)</p>
          </div>
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
