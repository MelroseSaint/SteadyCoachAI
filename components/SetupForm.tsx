import React, { useState } from 'react';
import { InterviewSettings, ApiConfig, PracticeMode, FeedbackDepth } from '../types';
import { ArrowRight, MessageSquare, Mic, ChevronDown, Zap, BookOpen, Clock, BarChart, Settings } from 'lucide-react';

interface SetupFormProps {
  onStart: (settings: InterviewSettings) => void;
  apiConfig: ApiConfig;
}

const ROLE_CATEGORIES = {
  "Engineering": [
    "Frontend Engineer",
    "Backend Engineer", 
    "Full Stack Engineer",
    "DevOps Engineer",
    "Mobile Developer (iOS/Android)",
    "Software Architect",
    "QA / SDET",
    "Security Engineer",
    "Engineering Manager"
  ],
  "Data & AI": [
    "Data Scientist",
    "Data Engineer",
    "Machine Learning Engineer", 
    "Data Analyst",
    "AI Research Scientist"
  ],
  "Product & Design": [
    "Product Manager",
    "Product Owner",
    "Product Designer (UI/UX)",
    "UX Researcher",
    "Technical Program Manager"
  ],
  "Business & Operations": [
    "Marketing Manager",
    "Sales Representative",
    "Customer Success Manager",
    "HR / Recruiter",
    "Business Analyst",
    "Finance Manager",
    "Executive / C-Suite"
  ]
};

export const SetupForm: React.FC<SetupFormProps> = ({ onStart, apiConfig }) => {
  const [selectedRole, setSelectedRole] = useState('Frontend Engineer');
  const [customRole, setCustomRole] = useState('');
  
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid-Senior' | 'Executive'>('Mid-Senior');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('structured');
  const [feedbackDepth, setFeedbackDepth] = useState<FeedbackDepth>('light');

  const [isLoading, setIsLoading] = useState(false);

  const isVoiceSupported = apiConfig.provider === 'gemini';
  const hasKey = !!apiConfig.apiKey;
  // If custom provider, we assume it's configured. If Gemini/OpenAI, we need a key.
  const isReady = hasKey || apiConfig.provider === 'custom';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const finalRole = selectedRole === 'Other' ? customRole : selectedRole;

    setTimeout(() => {
      onStart({ 
        role: finalRole, 
        company, 
        description, 
        experienceLevel, 
        mode,
        practiceMode,
        feedbackDepth
      });
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-normal text-gray-900 dark:text-white mb-2">Session Configuration</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">Set the context. The coach will adapt.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Primary Input - Role Selection */}
        <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Target Role</label>
            <div className="relative">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900/50 text-lg border-b border-gray-300 dark:border-zinc-700 py-2 pr-8 focus:border-gray-500 dark:focus:border-zinc-300 focus:outline-none transition-colors text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                    {Object.entries(ROLE_CATEGORIES).map(([category, roles]) => (
                        <optgroup key={category} label={category} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-300 font-sans">
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </optgroup>
                    ))}
                    <option value="Other" className="bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-300 font-semibold">Other (Type Custom)</option>
                </select>
                <ChevronDown className="absolute right-0 top-3 text-gray-400 dark:text-zinc-500 pointer-events-none" size={20} />
            </div>
            
            {/* Custom Role Input */}
            {selectedRole === 'Other' && (
                <div className="animate-fade-in mt-2">
                    <input
                        type="text"
                        required={selectedRole === 'Other'}
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Type your specific role..."
                        className="w-full bg-gray-50 dark:bg-zinc-800/50 text-base border border-gray-300 dark:border-zinc-700 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500"
                        autoFocus
                    />
                </div>
            )}
        </div>

        {/* Mode Selection */}
        <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Interview Format</label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setMode('text')}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all ${
                        mode === 'text' 
                        ? 'bg-gray-100 dark:bg-zinc-100 text-gray-900 dark:text-zinc-950 border-gray-200 dark:border-zinc-100 shadow-lg' 
                        : 'bg-white dark:bg-zinc-900/50 text-gray-400 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                    }`}
                >
                    <MessageSquare size={16} />
                    <span className="font-medium text-sm">Text Chat</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (isVoiceSupported) setMode('voice');
                    }}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all ${
                        mode === 'voice' 
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                        : isVoiceSupported 
                            ? 'bg-white dark:bg-zinc-900/50 text-gray-400 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                            : 'bg-gray-50 dark:bg-zinc-900/30 text-gray-300 dark:text-zinc-600 border-gray-100 dark:border-zinc-800/50 cursor-not-allowed'
                    }`}
                    title={!isVoiceSupported ? "Voice mode requires Gemini provider" : ""}
                >
                    <Mic size={16} />
                    <span className="font-medium text-sm">Voice Live</span>
                </button>
            </div>
        </div>

        {/* Practice Mode & Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Practice Goal</label>
                <div className="flex flex-col space-y-2">
                    {[
                        { id: 'structured', label: 'Structured', icon: BookOpen, desc: 'AI leads the flow' },
                        { id: 'refinement', label: 'Refinement', icon: Zap, desc: 'Critique & optimize' },
                        { id: 'simulation', label: 'Simulation', icon: Clock, desc: 'Timed & pressure' }
                    ].map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setPracticeMode(m.id as PracticeMode)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                                practiceMode === m.id
                                ? 'bg-gray-800 dark:bg-zinc-800 border-gray-600 dark:border-zinc-500 text-white'
                                : 'bg-transparent border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <m.icon size={14} />
                                <span className="font-medium text-xs">{m.label}</span>
                            </div>
                            <span className={`text-[9px] uppercase tracking-wider ${practiceMode === m.id ? 'text-gray-300 dark:text-zinc-400' : 'text-gray-400 dark:text-zinc-600'}`}>{m.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Feedback Depth</label>
                 <div className="flex flex-col space-y-2">
                    {[
                        { id: 'light', label: 'Light', desc: 'Encouraging' },
                        { id: 'standard', label: 'Standard', desc: 'Balanced' },
                        { id: 'deep', label: 'Deep', desc: 'Critical (High Perf)' }
                    ].map((f) => {
                         const isDisabled = f.id === 'deep' && !hasKey;
                         return (
                            <button
                                key={f.id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => setFeedbackDepth(f.id as FeedbackDepth)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all text-left ${
                                    feedbackDepth === f.id
                                    ? 'bg-gray-800 dark:bg-zinc-800 border-gray-600 dark:border-zinc-500 text-white'
                                    : isDisabled 
                                        ? 'opacity-50 cursor-not-allowed border-gray-100 dark:border-zinc-900 bg-gray-50 dark:bg-zinc-900/20'
                                        : 'bg-transparent border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900'
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <BarChart size={14} />
                                    <span className="font-medium text-xs">{f.label}</span>
                                </div>
                                <span className={`text-[9px] uppercase tracking-wider ${feedbackDepth === f.id ? 'text-gray-300 dark:text-zinc-400' : 'text-gray-400 dark:text-zinc-600'}`}>{f.desc}</span>
                            </button>
                         )
                    })}
                </div>
                {!hasKey && (
                    <p className="text-[10px] text-gray-500 dark:text-zinc-600 pt-1">
                        Connect API key for Deep feedback.
                    </p>
                )}
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Company (Optional)</label>
                <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-transparent text-base border-b border-gray-300 dark:border-zinc-700 py-1.5 focus:border-gray-500 dark:focus:border-zinc-300 focus:outline-none transition-colors text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
                placeholder="Name"
                />
            </div>
            
            <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">Experience</label>
                <div className="flex gap-4 pt-1">
                    {['Entry', 'Mid-Senior', 'Executive'].map((level) => (
                    <button
                        key={level}
                        type="button"
                        onClick={() => setExperienceLevel(level as any)}
                        className={`text-sm font-medium transition-colors ${
                        experienceLevel === level
                            ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white pb-1'
                            : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        {level}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Context / Job Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-transparent text-sm border-b border-gray-300 dark:border-zinc-700 py-1.5 focus:border-gray-500 dark:focus:border-zinc-300 focus:outline-none transition-colors text-gray-900 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 resize-none"
            placeholder="Paste key requirements or context..."
          />
        </div>

        <div className="pt-4 flex justify-center flex-col items-center space-y-3">
            <button
            type="submit"
            disabled={isLoading || (selectedRole === 'Other' && !customRole.trim())}
            className={`group flex items-center space-x-3 px-8 py-3.5 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                isReady 
                ? 'bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:bg-gray-800 dark:hover:bg-white'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/50'
            }`}
            >
            {isReady ? (
                <>
                    <span>{isLoading ? 'Initializing...' : `Start ${mode === 'voice' ? 'Voice' : 'Text'} Session`}</span>
                    {!isLoading && <ArrowRight size={18} className="text-white dark:text-zinc-800 group-hover:translate-x-1 transition-transform" />}
                </>
            ) : (
                <>
                    <span>Configure API Key to Start</span>
                    <Settings size={18} />
                </>
            )}
            </button>
            
            {!isReady && (
                <p className="text-xs text-gray-500 dark:text-zinc-500 animate-pulse">
                    This app requires a free Gemini API key to function.
                </p>
            )}
        </div>
      </form>
    </div>
  );
};