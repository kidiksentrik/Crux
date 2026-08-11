import { UserSettings, UserWordState } from './types';

const SETTINGS_KEY = 'crux_b1_user_settings';
const WORD_STATES_KEY = 'crux_b1_word_states';
const STREAK_KEY = 'crux_b1_user_streak';

export const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 10,
  ttsSpeed: 1.0,
  audioEnabled: true,
};

export function getStoredSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (e) {
    console.error('Failed to read settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getStoredWordStates(): Record<number, UserWordState> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(WORD_STATES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to read word states from localStorage', e);
    return {};
  }
}

export function updateWordStatus(wordId: number, status: 'learning' | 'mastered'): UserWordState {
  const states = getStoredWordStates();
  const existing = states[wordId] || {
    wordId,
    status: 'new',
    timesReviewed: 0,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: new Date().toISOString(),
  };

  const updated: UserWordState = {
    ...existing,
    status,
    timesReviewed: existing.timesReviewed + 1,
    lastReviewedAt: new Date().toISOString(),
  };

  states[wordId] = updated;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WORD_STATES_KEY, JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save word state to localStorage', e);
    }
  }

  return updated;
}

export interface UserStreak {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export function getStoredStreak(): UserStreak {
  if (typeof window === 'undefined') return { streak: 1, lastActiveDate: getTodayString() };
  try {
    const data = localStorage.getItem(STREAK_KEY);
    return data ? JSON.parse(data) : { streak: 1, lastActiveDate: getTodayString() };
  } catch {
    return { streak: 1, lastActiveDate: getTodayString() };
  }
}

export function recordTodayActivity(): UserStreak {
  const today = getTodayString();
  const current = getStoredStreak();

  if (current.lastActiveDate === today) {
    return current;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  let newStreak = 1;
  if (current.lastActiveDate === yesterdayString) {
    newStreak = current.streak + 1;
  }

  const updated = { streak: newStreak, lastActiveDate: today };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function exportUserDataCode(): string {
  if (typeof window === 'undefined') return '';
  const settings = getStoredSettings();
  const wordStates = getStoredWordStates();
  const streak = getStoredStreak();

  const payload = {
    v: 1,
    settings,
    wordStates,
    streak,
    exportedAt: new Date().toISOString(),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    return btoa(encodeURIComponent(jsonStr));
  } catch (e) {
    console.error('Failed to export sync code:', e);
    return '';
  }
}

export function importUserDataCode(codeString: string): boolean {
  if (typeof window === 'undefined' || !codeString) return false;
  try {
    const jsonStr = decodeURIComponent(atob(codeString.trim()));
    const payload = JSON.parse(jsonStr);

    if (payload && payload.settings && payload.wordStates && payload.streak) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
      localStorage.setItem(WORD_STATES_KEY, JSON.stringify(payload.wordStates));
      localStorage.setItem(STREAK_KEY, JSON.stringify(payload.streak));
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to import sync code:', e);
    return false;
  }
}
