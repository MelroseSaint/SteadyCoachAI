import React, { useEffect, useRef, useState, useCallback } from 'react';
import { InterviewSettings, ApiConfig, Message } from '../types';
import { useChat } from '../hooks/use-chat';
import { DEFAULT_INSTRUCTION, COACH_AVATAR_URL } from '../constants';
import { ArrowLeft, Mic, MicOff, RefreshCw, Square, Globe, ExternalLink, Copy, Check, Download, Printer, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveSession } from '../utils/storage';

interface ChatInterfaceProps {
  settings: InterviewSettings;
  apiConfig: ApiConfig;
  onBack: () => void;
  // Session Props
  sessionId?: string;
  initialMessages?: Message[];
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-2 flex items-center space-x-1.5 text-gray-500 hover:text-gray-700 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors group no-print"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check size={12} className="text-green-500" />
      ) : (
        <Copy size={12} className="group-hover:text-gray-900 dark:group-hover:text-zinc-300" />
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ settings, apiConfig, onBack, sessionId, initialMessages = [] }) => {
  const { messages, sendMessage, addMessage, isLoading, error, clearChat } = useChat(apiConfig, initialMessages);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-Save Logic
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
        // Debounce or just save on every update (localstorage is fast enough for text chat)
        saveSession({
            ...settings,
            id: sessionId,
            messages,
            timestamp: Date.now(), // update timestamp if needed, or keep original creation time? 
            // Better to keep creation timestamp in session prop, but we only have settings.
            // For now, let's assume saveSession handles updates correctly.
            // We need to ensure we pass the ORIGINAL timestamp if possible, or just Date.now() for "last updated"
            lastUpdated: Date.now()
        } as any);
    }
  }, [messages, sessionId, settings]);

  const initializeChat = useCallback(() => {
    // Only initialize if no messages exist (fresh session)
    if (initialMessages.length > 0 || messages.length > 0) return;

    // Determine Practice Mode specific instructions
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

    // Mode 3: User-Injected Context
    const systemPrompt = `
      ${DEFAULT_INSTRUCTION}
      
      CONTEXT (User-Provided):
      Role: ${settings.role}
      Experience: ${settings.experienceLevel}
      Company: ${settings.company || 'Not specified'}
      Job Description: ${settings.description || 'N/A'}

      CONFIGURATION:
      ${modeInstruction}
      ${depthInstruction}
    `;
    
    addMessage('system', systemPrompt);
    
    const startMsg = settings.practiceMode === 'refinement' 
        ? `I am ready to help you refine your answers for a ${settings.role} position. Please tell me which question you'd like to practice, or paste an answer you've prepared.`
        : `Please introduce yourself as "SteadyCoach" and start the interview for the ${settings.role} position. Keep it professional and direct.`;
    
    sendMessage(startMsg);
  }, [settings, addMessage, sendMessage, initialMessages.length, messages.length]);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    // Capture current input to append to
    const baseInput = inputRef.current?.value || '';

    recognition.onresult = (event: any) => {
       let transcript = '';
       for (let i = 0; i < event.results.length; ++i) {
         transcript += event.results[i][0].transcript;
       }
       
       const prefix = baseInput + (baseInput && !baseInput.endsWith(' ') ? ' ' : '');
       const newValue = prefix + transcript;
       
       setInput(newValue);
       if (inputRef.current) {
          inputRef.current.value = newValue; 
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
       }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening]); 

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleClearChat = () => {
    if (window.confirm('Restart session? This will clear current progress.')) {
      clearChat();
      setTimeout(initializeChat, 50);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      clearChat();
      setTimeout(initializeChat, 50);
    }
  };

  const handleExportTxt = () => {
    const chatText = messages
        .filter(m => m.role !== 'system')
        .map(m => `[${m.role === 'user' ? 'Candidate' : 'SteadyCoach'}]:\n${m.content}\n`)
        .join('\n-------------------\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `steadycoach-session-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const displayMessages = messages.filter(m => m.role !== 'system' && !m.content.includes('Please introduce yourself as "SteadyCoach"'));

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#09090b] relative transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/95 backdrop-blur-sm z-10 no-print transition-colors duration-300">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm font-medium flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            <span className="hidden sm:inline">Back to Setup</span>
        </button>
        <div className="flex flex-col items-center">
            <img 
              src={COACH_AVATAR_URL} 
              alt="Coach Avatar" 
              className="w-8 h-8 rounded-full object-cover mb-1 shadow-sm border border-gray-200 dark:border-zinc-700" 
            />
            <div className="flex items-center space-x-1.5">
                <span className="text-gray-900 dark:text-zinc-200 text-sm font-semibold tracking-wide">{settings.role}</span>
                {apiConfig.enableContextualGrounding && (
                    <Globe size={10} className="text-blue-600 dark:text-blue-400" />
                )}
            </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
             <button 
                onClick={handlePrint}
                className="text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors" 
                title="Print / Save PDF"
            >
                <Printer size={18} />
            </button>
            <button 
                onClick={handleExportTxt}
                className="text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-white transition-colors" 
                title="Export Text"
            >
                <Download size={18} />
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-zinc-700 mx-1 hidden sm:block"></div>
            <button 
                onClick={handleClearHistory}
                className="text-gray-500 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors hidden sm:block"
                title="Clear Chat History"
            >
                <Trash2 size={18} />
            </button>
            <button 
                onClick={handleClearChat} 
                className="text-gray-500 hover:text-red-500 dark:text-zinc-500 dark:hover:text-white transition-colors" 
                title="Restart Session"
            >
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {/* Screenplay Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
        <div className="max-w-3xl mx-auto py-12 space-y-10">
            {displayMessages.length === 0 && isLoading && (
                <div className="text-center text-gray-500 dark:text-zinc-500 font-medium animate-pulse">
                    Connecting to coach...
                </div>
            )}
            
            {displayMessages.map((msg) => (
            <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
                <div className={`text-xs uppercase tracking-widest mb-2 font-bold ${
                    msg.role === 'user' 
                    ? 'text-gray-400 dark:text-zinc-400 mr-1' 
                    : 'text-blue-600 dark:text-blue-400 ml-1'
                }`}>
                    {msg.role === 'user' ? 'You' : 'Coach'}
                </div>
                
                <div className={`max-w-[85%] leading-relaxed text-[16px] ${
                    msg.role === 'user' 
                        ? 'text-gray-800 dark:text-white text-right' 
                        : 'text-gray-700 dark:text-zinc-300 text-left'
                }`}>
                    <div className="prose dark:prose-invert prose-p:my-1 prose-ul:my-1 max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    
                    {/* Render Grounding Sources if present */}
                    {msg.groundingMetadata?.groundingChunks && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-800">
                            <p className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-wider font-bold mb-2 flex items-center">
                                <Globe size={10} className="mr-1" /> Sources
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {msg.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => {
                                    if (chunk.web) {
                                        return (
                                            <a 
                                                key={idx} 
                                                href={chunk.web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center space-x-1 px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded text-xs text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 transition-colors truncate max-w-[200px]"
                                            >
                                                <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                                                <ExternalLink size={10} />
                                            </a>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}

                    {msg.role === 'assistant' && isLoading && msg.content === '' && (
                         <span className="typing-cursor"></span>
                    )}

                    {/* Copy Button for Assistant */}
                    {msg.role === 'assistant' && msg.content && (
                      <CopyButton content={msg.content} />
                    )}
                </div>
            </div>
            ))}
            <div ref={messagesEndRef} className="h-24" />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-[#09090b] dark:via-[#09090b] pt-12 pb-8 px-4 no-print transition-colors duration-300">
        <div className="max-w-2xl mx-auto relative">
            <div className="relative group">
                <textarea 
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Listening... (speak now)" : "Type to answer..."}
                    className={`w-full transition-colors rounded-2xl py-4 pl-6 pr-24 outline-none resize-none border shadow-lg ${
                        isListening 
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 text-gray-900 dark:text-white placeholder-red-400' 
                        : 'bg-white hover:bg-gray-50 focus:bg-white dark:bg-zinc-900/80 dark:hover:bg-zinc-900 dark:focus:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 border-gray-200 dark:border-zinc-800 focus:border-gray-400 dark:focus:border-zinc-600'
                    }`}
                    style={{ minHeight: '56px' }}
                />
                
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all ${
                          isListening
                          ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-500 animate-pulse' 
                          : 'text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                      }`}
                      title="Toggle Voice Input"
                  >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button 
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      className={`p-2 rounded-full transition-all ${
                          isLoading
                          ? 'text-gray-400 dark:text-zinc-600'
                          : input.trim() 
                            ? 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white' 
                            : 'text-gray-400 dark:text-zinc-600'
                      }`}
                  >
                      {isLoading ? <Square size={16} className="animate-pulse" /> : <div className="w-4 h-4 bg-current rounded-sm" />} 
                  </button>
                </div>
            </div>
            {error && (
                <div className="mt-3 text-center text-sm text-red-500 dark:text-red-400 font-medium">
                    {error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
