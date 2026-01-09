import React, { useState, useEffect } from 'react';
import { SetupForm } from './components/SetupForm';
import { ChatInterface } from './components/ChatInterface';
import { SettingsDialog } from './components/SettingsDialog';
import { LegalModal } from './components/LegalModal';
import { ActiveInterview } from './components/ActiveInterview';
import { Sidebar } from './components/Sidebar';
import { InterviewSettings, AppState, ApiConfig, SavedSession } from './types';
import { Menu } from 'lucide-react';
import { PROVIDERS } from './constants';
import { getSessions, saveSession, deleteSession } from './utils/storage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [settings, setSettings] = useState<InterviewSettings | null>(null);
  
  // History State
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<any[]>([]);

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Legal State
  const [hasAcknowledged, setHasAcknowledged] = useState(() => localStorage.getItem('legal_acknowledged') === 'true');
  const [isLegalOpen, setIsLegalOpen] = useState(() => localStorage.getItem('legal_acknowledged') !== 'true');
  
  // Initialize API Config
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'gemini',
    apiKey: (typeof process !== 'undefined' && process.env?.API_KEY) || '', 
    baseUrl: PROVIDERS.gemini.baseUrl,
    model: PROVIDERS.gemini.defaultModel,
    enableContextualGrounding: false
  });

  // Effects
  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAcknowledge = () => {
    localStorage.setItem('legal_acknowledged', 'true');
    setHasAcknowledged(true);
    setIsLegalOpen(false);
  };

  const handleStartInterview = (newSettings: InterviewSettings) => {
    if (!apiConfig.apiKey && apiConfig.provider !== 'custom') {
        setIsSettingsOpen(true);
        return;
    }
    
    // Create new session ID
    const newSessionId = crypto.randomUUID();
    
    // Persist initial session structure (even if empty)
    const newSession: SavedSession = {
        ...newSettings,
        id: newSessionId,
        timestamp: Date.now(),
        lastUpdated: Date.now(),
        messages: [],
        title: `${newSettings.role} Interview`
    };
    saveSession(newSession);
    setSessions(getSessions()); // Refresh list

    setSettings(newSettings);
    setCurrentSessionId(newSessionId);
    setLoadedMessages([]); // Empty for new
    setAppState(AppState.INTERVIEW);
    setIsSidebarOpen(false); // Close mobile sidebar
  };

  const handleLoadSession = (session: SavedSession) => {
      // When loading a past session, we view it as a transcript (Text Mode)
      // regardless of whether it was originally voice or text.
      // The user can always start a *new* voice session if they want to speak again.
      setSettings({
          ...session,
          mode: 'text' // Force text mode for review
      });
      setCurrentSessionId(session.id);
      setLoadedMessages(session.messages || []);
      
      setAppState(AppState.INTERVIEW);
      setIsSidebarOpen(false);
  };

  const handleNewSession = () => {
      setAppState(AppState.SETUP);
      setSettings(null);
      setCurrentSessionId(null);
      setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Delete this session history?")) {
        const updated = deleteSession(id);
        setSessions(updated);
        if (currentSessionId === id) {
            handleNewSession();
        }
      }
  };

  const handleEndInterview = () => {
    // Refresh sessions list to show latest update timestamp/content
    setSessions(getSessions());
    setAppState(AppState.SETUP);
    setSettings(null);
    setCurrentSessionId(null);
  };

  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-zinc-200 font-sans overflow-hidden transition-colors duration-300">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleLoadSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLegal={() => setIsLegalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex flex-col h-full min-w-0">
          
          {/* Mobile Header (Only visible on small screens) */}
          <header className="md:hidden flex-none flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#09090b]">
             <div className="flex items-center space-x-3">
                 <button onClick={() => setIsSidebarOpen(true)} className="p-1 -ml-1">
                     <Menu size={24} className="text-gray-600 dark:text-zinc-400" />
                 </button>
                 <span className="font-semibold text-gray-900 dark:text-white">SteadyCoach</span>
             </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            {appState === AppState.SETUP && (
                <div className="h-full overflow-y-auto scroll-smooth p-4">
                     <div className="min-h-full flex flex-col items-center justify-center">
                        <div className="w-full max-w-xl animate-fade-in py-8">
                            <SetupForm onStart={handleStartInterview} apiConfig={apiConfig} />
                        </div>
                     </div>
                </div>
            )}

            {appState === AppState.INTERVIEW && settings && (
                <div className="h-full w-full">
                    {settings.mode === 'voice' ? (
                        <ActiveInterview
                            settings={settings}
                            apiConfig={apiConfig}
                            onEnd={handleEndInterview}
                            sessionId={currentSessionId!}
                        />
                    ) : (
                        <ChatInterface 
                            key={currentSessionId} // Force remount on session switch
                            sessionId={currentSessionId!}
                            initialMessages={loadedMessages}
                            settings={settings} 
                            apiConfig={apiConfig}
                            onBack={handleEndInterview}
                        />
                    )}
                </div>
            )}
          </main>
      </div>

      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSave={(newConfig) => {
            setApiConfig(newConfig);
            setIsSettingsOpen(false);
        }}
      />
      
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;