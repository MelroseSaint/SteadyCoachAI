import React from 'react';
import { SavedSession } from '../types';
import { Plus, Clock, Settings, MessageSquare, Mic, Trash2, Moon, Sun, ShieldCheck, X, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  sessions: SavedSession[];
  currentSessionId: string | null;
  onSelectSession: (session: SavedSession) => void;
  onNewSession: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onOpenSettings: () => void;
  onOpenLegal: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onOpenSettings,
  onOpenLegal,
  theme,
  onToggleTheme
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          w-[280px] bg-gray-50 dark:bg-[#09090b] border-r border-gray-200 dark:border-zinc-800
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="flex-none p-4 md:pt-6">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                        <span className="text-white dark:text-black font-bold text-lg">S</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white tracking-tight">SteadyCoach</span>
                </div>
                <button 
                  onClick={onCloseMobile}
                  className="md:hidden text-gray-500 dark:text-zinc-400 p-1"
                >
                  <X size={20} />
                </button>
            </div>

            <button
                onClick={onNewSession}
                className="w-full flex items-center justify-center space-x-2 bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-950 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
                <Plus size={18} />
                <span>New Interview</span>
            </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
            <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-3 mb-2">History</h3>
            {sessions.length === 0 ? (
                <div className="text-center py-8 px-4">
                    <Clock size={24} className="mx-auto text-gray-300 dark:text-zinc-700 mb-2" />
                    <p className="text-xs text-gray-400 dark:text-zinc-600">No past sessions yet.</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {sessions.map((session) => (
                        <button
                            key={session.id}
                            onClick={() => onSelectSession(session)}
                            className={`group w-full text-left p-3 rounded-xl transition-all relative ${
                                currentSessionId === session.id
                                ? 'bg-white dark:bg-zinc-800 shadow-sm border border-gray-200 dark:border-zinc-700'
                                : 'hover:bg-gray-100 dark:hover:bg-zinc-900/50 border border-transparent'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-medium text-sm text-gray-900 dark:text-zinc-200 truncate">
                                        {session.role || "Untitled Session"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5 truncate flex items-center">
                                        {session.mode === 'voice' ? <Mic size={10} className="mr-1" /> : <MessageSquare size={10} className="mr-1" />}
                                        {new Date(session.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        {session.company ? ` • ${session.company}` : ''}
                                    </div>
                                </div>
                                <div 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-3 p-1 text-gray-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 bg-gray-100 dark:bg-zinc-800 rounded"
                                    onClick={(e) => onDeleteSession(e, session.id)}
                                    title="Delete Session"
                                >
                                    <Trash2 size={14} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="flex-none p-4 border-t border-gray-200 dark:border-zinc-800 space-y-1">
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
                <Settings size={18} />
                <span>Settings</span>
            </button>
            <button 
                onClick={onToggleTheme}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
             <button 
                onClick={onOpenLegal}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
            >
                <ShieldCheck size={18} />
                <span>Legal & Privacy</span>
            </button>
        </div>
      </aside>
    </>
  );
};
