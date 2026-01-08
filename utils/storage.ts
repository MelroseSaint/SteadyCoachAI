import { SavedSession } from '../types';

const STORAGE_KEY = 'steadycoach_sessions';

export const getSessions = (): SavedSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSession = (session: SavedSession): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = { ...session, lastUpdated: Date.now() };
  } else {
    sessions.unshift({ ...session, lastUpdated: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const deleteSession = (id: string): SavedSession[] => {
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
};

export const clearSessions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
