'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [dailyLimit, setDailyLimit] = useState(1);
  const [categories, setCategories] = useState<string[]>(['infrastructure', 'technology']);
  const [targetLang, setTargetLang] = useState('PL');
  const [baseLang, setBaseLang] = useState('EN');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLimit = localStorage.getItem('crux_daily_limit');
      const storedCategories = localStorage.getItem('crux_categories');
      const storedTarget = localStorage.getItem('crux_target_lang');
      const storedBase = localStorage.getItem('crux_base_lang');

      setTimeout(() => {
        if (storedLimit) setDailyLimit(parseInt(storedLimit));
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        if (storedTarget) setTargetLang(storedTarget);
        if (storedBase) setBaseLang(storedBase);
      }, 0);
    }
  }, []);

  const handleCategoryToggle = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Save locally
      localStorage.setItem('crux_daily_limit', dailyLimit.toString());
      localStorage.setItem('crux_categories', JSON.stringify(categories));
      localStorage.setItem('crux_target_lang', targetLang);
      localStorage.setItem('crux_base_lang', baseLang);

      // 2. Attempt to save to Supabase user_settings
      // Create or use a fixed local user uuid for demonstration/persistence
      let userUuid = localStorage.getItem('crux_user_uuid');
      if (!userUuid) {
        userUuid = crypto.randomUUID();
        localStorage.setItem('crux_user_uuid', userUuid);
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: userUuid,
          daily_article_limit: dailyLimit,
          target_lang: targetLang,
          base_lang: baseLang,
          preferred_categories: categories,
        });

      if (error) {
        // Log error but proceed (since it might be due to missing schema/keys)
        console.warn('Database save failed, settings saved locally:', error);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const availableCategories = [
    { id: 'infrastructure', name: 'Infrastructure & City Transport' },
    { id: 'technology', name: 'Technology & Startups' },
    { id: 'economy', name: 'Economy & Local Business' },
  ];

  const targetLanguages = [
    { code: 'PL', name: 'Polish (PL)' },
    { code: 'ES', name: 'Spanish (ES)' },
    { code: 'FR', name: 'French (FR)' },
    { code: 'DE', name: 'German (DE)' },
  ];

  const baseLanguages = [
    { code: 'EN', name: 'English (EN)' },
    { code: 'ES', name: 'Spanish (ES)' },
    { code: 'PL', name: 'Polish (PL)' },
  ];

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-1.5 border-b border-[#161224] pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#A78BFA] to-[#F472B6] bg-clip-text text-transparent">
            Settings
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#161224] text-[#94A3B8] border border-[#2a2245]">
            Preferences
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] font-medium">
          Customize translation languages, categories, and limits.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Daily Article Count Limit Toggle */}
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Daily Article Limit
          </label>
          <div className="flex bg-[#0B0813] border border-[#2a2245] rounded-2xl p-1">
            {[1, 3, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setDailyLimit(num)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  dailyLimit === num
                    ? 'bg-[#A78BFA] text-[#0B0813] shadow-md scale-102'
                    : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
              >
                {num} {num === 1 ? 'Article' : 'Articles'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Checkboxes */}
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl space-y-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Preferred Categories
          </label>
          <div className="flex flex-col gap-2.5">
            {availableCategories.map((cat) => {
              const isChecked = categories.includes(cat.id);
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isChecked
                      ? 'bg-[#251f3d]/40 border-[#A78BFA]/50 text-[#E2E8F0]'
                      : 'bg-[#0B0813]/60 border-[#2a2245] text-[#94A3B8] hover:border-[#382e5c]'
                  }`}
                >
                  <span className="text-xs font-semibold">{cat.name}</span>
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isChecked
                        ? 'bg-[#A78BFA] border-[#A78BFA] text-[#0B0813]'
                        : 'border-[#2a2245]'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Engine Settings */}
        <div className="bg-[#161224] border border-[#2a2245] rounded-3xl p-5 shadow-xl space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Language Engine Defaults
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Target Lang */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                Target Language
              </span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-[#0B0813] border border-[#2a2245] rounded-2xl p-3 text-xs text-[#E2E8F0] font-semibold outline-none focus:border-[#A78BFA]"
              >
                {targetLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Lang */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-wider">
                Base Language
              </span>
              <select
                value={baseLang}
                onChange={(e) => setBaseLang(e.target.value)}
                className="w-full bg-[#0B0813] border border-[#2a2245] rounded-2xl p-3 text-xs text-[#E2E8F0] font-semibold outline-none focus:border-[#A78BFA]"
              >
                {baseLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-[#A78BFA] to-[#F472B6] disabled:from-[#251f3d] disabled:to-[#251f3d] hover:brightness-110 active:scale-[0.98] transition-all text-[#0B0813] disabled:text-[#94A3B8] font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
        >
          {saving ? (
            <span>Saving Settings...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Settings Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
