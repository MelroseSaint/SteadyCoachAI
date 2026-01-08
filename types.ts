export type PracticeMode = 'structured' | 'refinement' | 'simulation';
export type FeedbackDepth = 'light' | 'standard' | 'deep';

export interface InterviewSettings {
  role: string;
  company: string;
  description: string;
  experienceLevel: 'Entry' | 'Mid-Senior' | 'Executive';
  mode: 'text' | 'voice';
  practiceMode: PracticeMode;
  feedbackDepth: FeedbackDepth;
}

export enum AppState {
  SETUP = 'SETUP',
  INTERVIEW = 'INTERVIEW',
}

export interface ApiConfig {
  provider: 'gemini' | 'openai' | 'groq' | 'custom';
  apiKey: string;
  baseUrl: string;
  model: string;
  enableContextualGrounding: boolean;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id: string;
  groundingMetadata?: any;
}