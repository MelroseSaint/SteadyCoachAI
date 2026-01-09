import React, { useEffect, useState, useCallback } from 'react';
import { InterviewSettings, ApiConfig, Message } from '../types';
import { useLiveApi } from '../hooks/use-live-api';
import { AudioVisualizer } from './AudioVisualizer';
import { DEFAULT_INSTRUCTION, COACH_AVATAR_URL } from '../constants';
import { PhoneOff, Mic, MicOff, AlertCircle, MessageSquare, X, Star } from 'lucide-react';
import { saveSession } from '../utils/storage';

interface ActiveInterviewProps {
  settings: InterviewSettings;
  apiConfig: ApiConfig;
  onEnd: () => void;
  sessionId: string;
}

export const ActiveInterview: React.FC<ActiveInterviewProps> = ({ settings, apiConfig, onEnd, sessionId }) => {
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Construct a personalized system instruction
  let modeInstruction = "";
    switch (settings.practiceMode) {
        case 'structured':
            modeInstruction = "MODE: STRUCTURED INTERVIEW. Take charge of the conversation. Ask one specific question at a time. Maintain a logical flow similar to a real interview.";
            break;
        case 'refinement':
            modeInstruction = "MODE: ANSWER REFINEMENT. The user will provide answers. Your primary goal is to critique their answer on clarity, structure (STAR method), and impact. Then ask them to try again or ask a follow-up.";
            break;
        case 'simulation':
            modeInstruction = "MODE: SIMULATION. High pressure. Be stricter with your evaluation. Don't be overly encouraging; be neutral and professional. Ask challenging follow-ups immediately.";
            break;
    }

  const depthInstruction = `FEEDBACK DEPTH: ${settings.feedbackDepth.toUpperCase()}. ${
        settings.feedbackDepth === 'light' ? "Be encouraging and gentle." :
        settings.feedbackDepth === 'deep' ? "Be highly critical, point out every flaw, and demand high standards." :
        "Balance encouragement with constructive criticism."
    }`;

  const instruction = `
    ${DEFAULT_INSTRUCTION}
    
    Current Interview Context:
    Target Role: ${settings.role}
    Experience Level: ${settings.experienceLevel}
    ${settings.company ? `Target Company: ${settings.company}` : ''}
    ${settings.description ? `Job Context: ${settings.description}` : ''}
    
    CONFIGURATION:
    ${modeInstruction}
    ${depthInstruction}
    
    You are speaking with the candidate now via a voice call.
    Your output must be speech-friendly. Keep sentences moderately short.
  `;

  // Callback to handle incoming transcripts from the Live API
  const handleTranscript = useCallback((role: 'user' | 'assistant', text: string) => {
    const newMessage: Message = {
        id: crypto.randomUUID(),
        role,
        content: text
    };
    
    setMessages(prev => {
        const updated = [...prev, newMessage];
        // Persist to local storage immediately
        saveSession({
            ...settings,
            id: sessionId,
            messages: updated,
            timestamp: Date.now(), // Keeps original creation time? Ideally passed from parent. 
            lastUpdated: Date.now()
        } as any);
        return updated;
    });
  }, [settings, sessionId]);

  const { connect, disconnect, isConnected, isAiSpeaking, volume } = useLiveApi({
    systemInstruction: instruction,
    apiKey: apiConfig.apiKey,
    onError: (err) => setError(err.message),
    onTranscript: handleTranscript,
    onDisconnect: () => {
       // Optional: Auto-end or show reconnection logic
    }
  });

  // Auto-connect on mount
  useEffect(() => {
    // Small delay to allow UI to settle
    const timeout = setTimeout(() => {
      connect();
    }, 500);
    return () => clearTimeout(timeout);
  }, [connect]);

  const handleEndCall = () => {
    disconnect();
    onEnd();
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    console.log('Feedback submitted:', { rating: feedbackRating, text: feedbackText });
    
    setIsFeedbackOpen(false);
    setFeedbackRating(0);
    setFeedbackText('');
    alert('Thank you for your feedback!');
  };

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-red-100 dark:bg-red-500/10 p-4 rounded-full mb-4 text-red-500 dark:text-red-400">
                <AlertCircle size={48} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Error</h3>
            <p className="text-gray-600 dark:text-zinc-400 mb-6">{error}</p>
            <button 
                onClick={onEnd}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
                Return to Home
            </button>
        </div>
     )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative">
      {/* Header Info */}
      <div className="mb-6 flex justify-between items-center bg-white/80 dark:bg-slate-800/80 p-5 rounded-xl border border-gray-200 dark:border-slate-700 backdrop-blur-md transition-colors">
        <div>
           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{settings.role} Interview</h2>
           <p className="text-sm text-gray-500 dark:text-slate-300 font-medium">
             {settings.company ? `at ${settings.company}` : 'Mock Interview'} • {settings.experienceLevel} Level
           </p>
        </div>
        
        <div className="flex items-center space-x-6">
            <button 
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white transition-colors text-sm font-semibold"
            >
                <MessageSquare size={18} />
                <span>Feedback</span>
            </button>

            <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-slate-600 pl-6">
                <span className={`flex h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                    {isConnected ? 'Live' : 'Connecting...'}
                </span>
            </div>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-gray-300 dark:border-slate-700 shadow-2xl overflow-hidden p-8 transition-colors duration-500">
        
        {/* Avatar / Status Indicator */}
        <div className="mb-12 relative">
            <div className={`w-36 h-36 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 border-4 ${
                isAiSpeaking 
                ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.5)] scale-110' 
                : 'border-gray-200 dark:border-slate-700 shadow-lg'
            }`}>
               <img 
                 src={COACH_AVATAR_URL} 
                 alt="Interviewer Agent"
                 className="w-full h-full object-cover"
               />
            </div>
            {isAiSpeaking && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-blue-600 dark:text-blue-400 font-semibold text-sm animate-pulse whitespace-nowrap">
                    Interviewer is speaking...
                </div>
            )}
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full max-w-2xl">
           <AudioVisualizer active={isConnected} volume={volume} isAiSpeaking={isAiSpeaking} />
        </div>
        
        <p className="mt-8 text-gray-500 dark:text-slate-400 text-sm font-medium tracking-wide">
            {isConnected ? "Listening to you..." : "Establishing secure connection..."}
        </p>

      </div>

      {/* Controls Bar */}
      <div className="mt-8 flex justify-center items-center space-x-6">
         <button 
            onClick={handleEndCall}
            className="flex items-center px-8 py-4 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/50 rounded-full font-bold transition-all hover:scale-105"
         >
            <PhoneOff size={24} className="mr-3" />
            End Interview
         </button>
      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl border border-gray-200 dark:border-slate-600 shadow-2xl overflow-hidden animate-fade-in transition-colors">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700/50">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Session Feedback</h3>
                    <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">Rate Experience</label>
                        <div className="flex justify-center space-x-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedbackRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star 
                                        size={32} 
                                        className={`${star <= feedbackRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-slate-600"} transition-colors`} 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">Comments</label>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 rounded-xl p-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-32"
                            placeholder="How was the audio quality? Was the coach helpful?"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};