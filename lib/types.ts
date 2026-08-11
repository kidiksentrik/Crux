export type B1Category = 
  | 'Official / Administrative'
  | 'Grammar Connectors'
  | 'Verb Aspect Pairs'
  | 'Daily Life & Home'
  | 'Work & Education'
  | 'Travel & City';

export interface B1Word {
  id: number;
  word: string;
  base_form: string;
  category: B1Category;
  meaning_en: string;
  example_pl: string;
  example_en: string;
  synonyms: string[];
}

export type MasteryStatus = 'new' | 'learning' | 'mastered';

export interface UserWordState {
  wordId: number;
  status: MasteryStatus;
  timesReviewed: number;
  lastReviewedAt: string; // ISO date
  nextReviewAt: string; // ISO date
}

export interface UserSettings {
  dailyGoal: number; // 5, 10, 20
  ttsSpeed: number; // 0.8, 1.0, 1.2
  audioEnabled: boolean;
}

export interface QuizQuestion {
  word: B1Word;
  options: string[]; // 4 English options
  correctAnswer: string;
  exampleSentence?: string;
}
