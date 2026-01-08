
export const DEFAULT_INSTRUCTION = `
You are an expert technical interviewer and hiring manager named "SteadyCoach". 
Your goal is to conduct a realistic, professional, yet supportive job interview via text chat.
You will be provided with the candidate's target role, company (optional), and job description (optional).
Start by briefly introducing yourself and asking the first question.
Wait for the candidate to answer before asking the next question.
Ask follow-up questions based on their answers to dig deeper into their experience.
Keep your responses concise and conversational (under 150 words usually).
If the candidate struggles, offer a small hint or rephrase the question.
`;

export const PROVIDERS = {
  gemini: {
    name: 'SteadyCoach Free (Gemini)',
    baseUrl: '', // Not used for SDK
    defaultModel: 'gemini-3-flash-preview'
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o'
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama3-8b-8192'
  },
  custom: {
    name: 'Custom / Other',
    baseUrl: '',
    defaultModel: ''
  }
};

export const SAMPLE_RATE_INPUT = 16000;
export const SAMPLE_RATE_OUTPUT = 24000;
export const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

// Professional woman placeholder resembling the provided image
export const COACH_AVATAR_URL = 'https://images.generated.photos/vmb60Gy5dtfzvX6D8wAVbhdQ04vMzUJTHP_HLuhpoQA/rs:fit:256:256/czM6Ly9pY29uczgu/Z3Bob3Rvcy1wcm9k/LnBob3Rvcy92Ml8w/NTQ2MTAxLmpwZw.jpg';
