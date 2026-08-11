'use client';

import React, { useState } from 'react';
import b1VocabData from '@/data/b1_vocab.json';
import { B1Word, UserSettings } from '@/lib/types';
import { getStoredSettings, saveStoredSettings } from '@/lib/storage';

import DailyCardsTab from '@/components/DailyCardsTab';
import QuizTab from '@/components/QuizTab';
import BinderTab from '@/components/BinderTab';
import SettingsTab from '@/components/SettingsTab';

type ActiveTab = 'daily' | 'quiz' | 'binder' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('daily');
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const words = b1VocabData as B1Word[];

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      {/* Top Mobile Glass Header */}
      <header className="sticky top-0 z-40 card-glass border-b border-white/10 px-4 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-black font-black text-sm shadow-lg shadow-amber-500/20">
            B1
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
              Crux <span className="text-amber-400 text-xs font-normal">Exam Trainer</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Polish B1 Certification</p>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          PL / EN
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {activeTab === 'daily' && (
          <DailyCardsTab
            allWords={words}
            dailyGoal={settings.dailyGoal}
            ttsSpeed={settings.ttsSpeed}
            onGoToQuiz={() => setActiveTab('quiz')}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab allWords={words} ttsSpeed={settings.ttsSpeed} />
        )}

        {activeTab === 'binder' && (
          <BinderTab allWords={words} ttsSpeed={settings.ttsSpeed} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* Glassmorphic Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 card-glass border-t border-white/10 px-6 py-2.5">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'daily'
                ? 'text-amber-400 scale-105 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">🎴</span>
            <span className="text-[11px]">Daily Cards</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'quiz'
                ? 'text-blue-400 scale-105 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">⚔️</span>
            <span className="text-[11px]">Quiz Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('binder')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'binder'
                ? 'text-emerald-400 scale-105 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">📖</span>
            <span className="text-[11px]">Binder</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'settings'
                ? 'text-purple-400 scale-105 font-bold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[11px]">Settings</span>
          </button>
        </div>
      </nav>
    </main>
  );
}
