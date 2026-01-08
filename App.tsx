import React, { useState, useEffect } from 'react';
import { SetupForm } from './components/SetupForm';
import { ChatInterface } from './components/ChatInterface';
import { SettingsDialog } from './components/SettingsDialog';
import { LegalModal } from './components/LegalModal';
import { ActiveInterview } from './components/ActiveInterview';
import { InterviewSettings, AppState, ApiConfig } from './types';
import { Settings, ShieldCheck, Moon, Sun } from 'lucide-react';
import { PROVIDERS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [settings, setSettings] = useState<InterviewSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Theme State - Lazy init to prevent flash
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Legal State - Lazy init to prevent flash
  const [hasAcknowledged, setHasAcknowledged] = useState(() => localStorage.getItem('legal_acknowledged') === 'true');
  const [isLegalOpen, setIsLegalOpen] = useState(() => localStorage.getItem('legal_acknowledged') !== 'true');
  
  // Initialize with Gemini as default
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'gemini',
    // Safe access for process.env to prevent browser crashes if polyfill is missing
    apiKey: (typeof process !== 'undefined' && process.env?.API_KEY) || '', 
    baseUrl: PROVIDERS.gemini.baseUrl,
    model: PROVIDERS.gemini.defaultModel,
    enableContextualGrounding: false // Default to Mode 1 (Local Context Only)
  });

  useEffect(() => {
    // Apply theme class to html
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAcknowledge = () => {
    localStorage.setItem('legal_acknowledged', 'true');
    setHasAcknowledged(true);
    setIsLegalOpen(false);
  };

  const handleStartInterview = (newSettings: InterviewSettings) => {
    // Check if key is present for providers that need it (Gemini & OpenAI & Groq)
    // Custom provider might use a proxy, so we allow it empty
    if (!apiConfig.apiKey && apiConfig.provider !== 'custom') {
        setIsSettingsOpen(true);
        return;
    }
    setSettings(newSettings);
    setAppState(AppState.INTERVIEW);
  };

  const handleEndInterview = () => {
    setAppState(AppState.SETUP);
    setSettings(null);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-200 font-sans overflow-hidden transition-colors duration-300">
      
      {appState === AppState.SETUP && (
          <>
            {/* Minimal Header */}
            <header className="flex-none flex items-center justify-between px-8 py-6 z-10">
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold tracking-wide text-gray-800 dark:text-zinc-100 dark:opacity-90">
                        SteadyCoach
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={toggleTheme}
                        className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        title="Settings"
                    >
                        <Settings size={22} />
                    </button>
                </div>
            </header>

            {/* Scrollable Main Content Area */}
            <main className="flex-1 overflow-y-auto scroll-smooth p-4">
                <div className="min-h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-xl animate-fade-in py-4">
                        <SetupForm onStart={handleStartInterview} apiConfig={apiConfig} />
                        
                        {!apiConfig.apiKey && apiConfig.provider !== 'custom' && (
                            <div className="mt-8 text-center text-red-500 dark:text-zinc-400 text-sm pb-8">
                            API key required in settings.
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer with Positioning Statement */}
            <footer className="flex-none w-full py-6 px-8 text-center border-t border-gray-200 dark:border-zinc-800/50 bg-gray-100 dark:bg-[#09090b] transition-colors">
                <div className="flex justify-center items-center space-x-4 mb-2">
                     <button 
                        onClick={() => setIsLegalOpen(true)}
                        className="flex items-center space-x-1 text-[10px] uppercase tracking-wider text-gray-600 hover:text-gray-900 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                    >
                        <ShieldCheck size={12} />
                        <span>FAQ • Terms • Privacy</span>
                    </button>
                </div>
                
                <p className="text-gray-400 dark:text-zinc-600 text-[10px]">
                    also developed by <a href="https://darkstackstudiosinc.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-zinc-400 underline decoration-zinc-400 dark:decoration-zinc-700 underline-offset-2 transition-colors">DarkStackStudiosInc</a>
                </p>
            </footer>
          </>
      )}

      {appState === AppState.INTERVIEW && settings && (
        <>
            {settings.mode === 'voice' ? (
                <ActiveInterview
                    settings={settings}
                    apiConfig={apiConfig}
                    onEnd={handleEndInterview}
                />
            ) : (
                <ChatInterface 
                    settings={settings} 
                    apiConfig={apiConfig}
                    onBack={handleEndInterview}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            )}
        </>
      )}

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={(newConfig) => {
            setApiConfig(newConfig);
            setIsSettingsOpen(false);
        }}
      />
      
      {/* Legal Modal - Handles both initial gate and footer view */}
      <LegalModal 
        isOpen={isLegalOpen} 
        initialMode={!hasAcknowledged} 
        onAcknowledge={handleAcknowledge}
        onClose={() => setIsLegalOpen(false)}
      />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;