import React, { useState } from 'react';
import { Shield, Lock, FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  initialMode: boolean; // true = the initial "Gate", false = viewing from footer
  onAcknowledge: () => void;
  onClose: () => void;
}

type Tab = 'faq' | 'terms' | 'privacy' | 'security';

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, initialMode, onAcknowledge, onClose }) => {
  const [showFullPolicies, setShowFullPolicies] = useState(!initialMode);
  const [activeTab, setActiveTab] = useState<Tab>(initialMode ? 'terms' : 'faq');

  if (!isOpen) return null;

  const handleInitialAcknowledge = () => {
    onAcknowledge();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
            <div className="space-y-8 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                
                <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">1. General</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: What is this application?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: This is a client-only AI interview coaching tool that allows you to practice interviews in real time. It provides structured practice, answer refinement, and live simulation to help you prepare for professional interactions. The application runs entirely on your device, with optional integration to third-party AI services.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Do I need an account to use it?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: No. The app is fully functional without an account. All data is stored locally on your device.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Does this guarantee I will pass interviews or get hired?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: No. This tool is for practice and learning only. Interview outcomes depend on many factors, and this application does not provide guarantees.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">2. Free Tier</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: What can I do on the free tier?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Free users can practice in real time with structured, refinement, or live simulation modes, receive answer feedback, use user-provided context, and export session content.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Are there limits on the free tier?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Yes, to ensure reliable performance: Up to 5 active sessions per day, ~10–12 turns per session, short-term memory (session only), and limited follow-up depth.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: What happens when I reach free-tier limits?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: You will see a message: "This practice session has reached its current depth." You can start a new session or connect your own API key for extended practice.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Can free-tier users use real-time contextual information?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: No. Free users can only use context they manually provide. Real-time provider-sourced context is available only for BYOK users.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">3. Bring-Your-Own-API (BYOK)</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: What does BYOK mean?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: BYOK means you can connect your own API key from a supported AI provider. This gives you extended session length, higher memory depth, real-time context retrieval, and advanced customization.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Do you store my API key?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: No. Your API key is stored locally on your device only. It is never transmitted to or accessible by the developer.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Who is responsible for usage and billing with my API key?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: You are fully responsible. All requests go directly from your device to the provider. The developer does not monitor usage, manage billing, or enforce limits.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">4. Privacy & Security</h4>
                    <div className="space-y-4">
                         <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Does this app send my data to the developer?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: No. All session data, preferences, and optional API keys are stored locally. Nothing is transmitted to any server.</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Is my practice private?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Yes. Since everything is stored locally and no tracking or analytics is used, your sessions remain private to your device.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">5. Functionality & Features</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: What practice modes are available?</p>
                            <ul className="list-disc pl-5 text-gray-600 dark:text-zinc-400 mt-1 space-y-1">
                                <li><strong>Structured Interview Mode:</strong> AI leads with pre-defined question flow</li>
                                <li><strong>Answer Refinement Mode:</strong> AI critiques answers submitted by the user</li>
                                <li><strong>Live Simulation Mode:</strong> Timed practice with realistic pacing and pressure</li>
                            </ul>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Can I customize the interviewer or difficulty?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Free-tier users cannot. BYOK users can adjust interviewer persona, strictness, role focus, and feedback depth.</p>
                        </div>
                    </div>
                </section>

                 <section>
                    <h4 className="font-bold text-gray-800 dark:text-zinc-100 mb-2">6. Support & Troubleshooting</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: My provider API key is not working. What should I do?</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Check your provider dashboard for key validity, usage limits, and billing. The app does not manage provider keys.</p>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-700 dark:text-zinc-200">Q: Real-time context seems inaccurate.</p>
                            <p className="text-gray-600 dark:text-zinc-400">A: Accuracy depends on the third-party provider and context supplied. The developer does not verify or store retrieved information.</p>
                        </div>
                    </div>
                </section>
            </div>
        );
      case 'terms':
        return (
          <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h3>
            
            <section className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                 <h4 className="font-semibold text-blue-800 dark:text-blue-100 mb-2">Real-Time Practice Disclaimer</h4>
                 <p className="text-gray-700 dark:text-zinc-300">Real-time practice features simulate interview scenarios through automated conversational responses and do not represent actual interviewers, employers, or hiring processes.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Free Tier Clause</h4>
              <p>Free-tier access is subject to reasonable usage limits designed to maintain reliability and availability.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">BYOK Clause</h4>
              <p>The developer does not access, store, or manage user-provided API credentials or third-party service usage. When using your own API key, requests are sent directly to the selected provider and are subject to that provider’s pricing, limits, and data policies.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Purpose and Scope</h4>
              <p>This software provides interview preparation and communication coaching tools intended solely for informational and educational use. The software does not guarantee interview outcomes, employment decisions, job offers, or professional advancement.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">No Professional Advice</h4>
              <p>The software does not provide legal, human resources, career, financial, or professional advice. All guidance generated by the application is general in nature and must be independently evaluated by the user before use.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Limitation of Liability</h4>
              <p>To the maximum extent permitted by law, the developer shall not be liable for: Interview outcomes or employment decisions; Lost opportunities or reputational harm; Reliance on AI-generated content; or Data loss caused by device failure, browser actions, or user configuration.</p>
            </section>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h3>
            
            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Data Collection & Storage</h4>
              <p>This application does not collect, transmit, or store personal data on developer-controlled servers. All data—including session history, preferences, and optional API credentials—is stored locally on the user’s device.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Data Persistence</h4>
              <p>Local data persists only on the user’s device. Clearing browser data, uninstalling the application, or resetting the device will permanently remove all stored information.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">No Analytics or Tracking</h4>
              <p>The application does not use analytics services, tracking scripts, cookies, telemetry, or behavioral monitoring of any kind.</p>
            </section>
            
            <section className="bg-gray-100 dark:bg-zinc-900/50 p-3 rounded border border-gray-200 dark:border-zinc-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Contextual Retrieval</h4>
                <p className="text-gray-600 dark:text-zinc-400">Contextual retrieval, when enabled, occurs only during active requests and is handled exclusively by the selected third-party provider. No retrieved data is stored or logged by the developer.</p>
            </section>

            <section>
              <h4 className="font-semibold text-gray-800 dark:text-zinc-100 mb-1">Third-Party Data Handling</h4>
              <p>If a third-party AI provider is enabled, data sent to that provider is governed solely by their privacy policy and data handling practices.</p>
            </section>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security & Architecture</h3>
            
            <section>
                <div className="bg-gray-100 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 mb-4">
                    <p className="mb-2 font-medium text-gray-900 dark:text-white">Client-Only Architecture</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-zinc-400">
                        <li>No centralized databases</li>
                        <li>No authentication servers</li>
                        <li>No background synchronization</li>
                        <li>No remote data recovery</li>
                    </ul>
                </div>
                <p>This architecture reduces centralized data risk but places responsibility for security on the user’s device and browser environment.</p>
            </section>
          </div>
        );
    }
  };

  // Initial Gate View
  if (!showFullPolicies && initialMode) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
        <div className="bg-white dark:bg-[#18181b] w-full max-w-lg rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-2xl p-8 animate-fade-in text-center transition-colors">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-800 dark:text-zinc-200">
                    <Shield size={32} />
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Local-Only Application Notice
            </h2>
            
            <div className="text-gray-600 dark:text-zinc-300 text-sm mb-6 leading-relaxed text-left space-y-4">
                <p>
                    This application operates entirely on your device. 
                    It does not use user accounts, backend servers, or developer-controlled cloud storage.
                </p>
                <p>
                    All data—including session content, preferences, and optional third-party API credentials—is stored locally within your browser or installed application environment.
                </p>
                <p className="font-medium text-gray-800 dark:text-zinc-200">
                    The developer does not receive, store, process, or have access to any user data.
                </p>
                <p className="text-gray-400 dark:text-zinc-400 text-xs">
                    If you choose to connect a third-party AI service using your own API credentials, all requests are transmitted directly from your device to that provider and are governed solely by their terms and privacy policies.
                </p>
            </div>

            <div className="space-y-4 pt-2">
                <button 
                    onClick={handleInitialAcknowledge}
                    className="w-full py-3 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 rounded-lg font-bold transition-colors flex items-center justify-center space-x-2"
                >
                    <CheckCircle size={16} />
                    <span>I acknowledge and accept these conditions</span>
                </button>
                
                <div className="flex justify-center space-x-6 text-xs text-gray-500 dark:text-zinc-500">
                    <button onClick={() => setShowFullPolicies(true)} className="hover:text-gray-800 dark:hover:text-zinc-300 underline underline-offset-4">
                        View Full Terms
                    </button>
                    <button onClick={() => { setShowFullPolicies(true); setActiveTab('privacy'); }} className="hover:text-gray-800 dark:hover:text-zinc-300 underline underline-offset-4">
                        View Privacy Policy
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Full Policy View
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#18181b] w-full max-w-2xl h-[85vh] rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-2xl flex flex-col animate-fade-in transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Legal & Resources</h2>
            {!initialMode && (
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white transition-colors">
                    Close
                </button>
            )}
            {initialMode && (
                <button 
                    onClick={() => setShowFullPolicies(false)}
                    className="text-sm text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    Back to Notice
                </button>
            )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] overflow-x-auto transition-colors">
            <button 
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors min-w-[80px] ${activeTab === 'faq' ? 'border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
                <div className="flex items-center justify-center space-x-2">
                    <HelpCircle size={16} />
                    <span>FAQ</span>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab('terms')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors min-w-[80px] ${activeTab === 'terms' ? 'border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
                <div className="flex items-center justify-center space-x-2">
                    <FileText size={16} />
                    <span>Terms</span>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab('privacy')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors min-w-[80px] ${activeTab === 'privacy' ? 'border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
                <div className="flex items-center justify-center space-x-2">
                    <Lock size={16} />
                    <span>Privacy</span>
                </div>
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors min-w-[80px] ${activeTab === 'security' ? 'border-gray-900 dark:border-zinc-100 text-gray-900 dark:text-white bg-gray-50 dark:bg-zinc-900/50' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'}`}
            >
                <div className="flex items-center justify-center space-x-2">
                    <Shield size={16} />
                    <span>Security</span>
                </div>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50 dark:bg-[#09090b] transition-colors">
            {renderContent()}
        </div>

        {/* Footer actions if in initial mode */}
        {initialMode && (
             <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#18181b] transition-colors">
                <button 
                    onClick={handleInitialAcknowledge}
                    className="w-full py-3 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 rounded-lg font-bold transition-colors"
                >
                    I acknowledge and accept these conditions
                </button>
             </div>
        )}
      </div>
    </div>
  );
};