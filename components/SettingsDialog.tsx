import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';
import { PROVIDERS } from '../constants';
import { X, Loader2, AlertCircle, Shield, Globe } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(config);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
    setValidationError(null);
  }, [config, isOpen]);

  const handleProviderChange = (provider: ApiConfig['provider']) => {
    setLocalConfig(prev => ({
      ...prev,
      provider,
      baseUrl: PROVIDERS[provider].baseUrl,
      model: PROVIDERS[provider].defaultModel,
      apiKey: provider === 'gemini' && config.provider !== 'gemini' ? '' : prev.apiKey,
      enableContextualGrounding: false // Reset grounding when switching providers
    }));
    setValidationError(null);
  };

  const validateConfig = async (cfg: ApiConfig): Promise<boolean> => {
    if (cfg.provider === 'custom') return true; 
    if (cfg.provider === 'gemini' && !cfg.apiKey) return true; 

    try {
      if (cfg.provider === 'gemini') {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cfg.apiKey}`);
          return res.ok;
      } else {
          const res = await fetch(`${cfg.baseUrl}/models`, {
              headers: { 'Authorization': `Bearer ${cfg.apiKey}` }
          });
          return res.ok;
      }
    } catch (e) {
      console.warn("Validation error:", e);
      return false;
    }
  };

  const handleSave = async () => {
    setValidationError(null);
    setIsValidating(true);
    
    await new Promise(r => setTimeout(r, 500));

    const isValid = await validateConfig(localConfig);
    setIsValidating(false);

    if (isValid) {
      onSave(localConfig);
    } else {
      setValidationError("Failed to verify API key. Please check your settings.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-zinc-700/50 bg-white dark:bg-[#18181b] sticky top-0 z-10 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Configuration
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PROVIDERS) as Array<keyof typeof PROVIDERS>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleProviderChange(key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all text-left truncate ${
                    localConfig.provider === key
                      ? 'bg-gray-800 dark:bg-zinc-800 border-gray-600 dark:border-zinc-500 text-white shadow-sm'
                      : 'bg-transparent border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-gray-400 dark:hover:border-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {PROVIDERS[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Context Controls */}
          {localConfig.provider === 'gemini' && (
             <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={localConfig.enableContextualGrounding}
                            onChange={(e) => setLocalConfig({...localConfig, enableContextualGrounding: e.target.checked})}
                            className="w-4 h-4 rounded border-gray-400 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-zinc-800"
                        />
                        <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Enable Contextual Retrieval</span>
                    </label>
                    <Globe size={16} className="text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Enabling contextual retrieval may improve relevance but reduces predictability and increases reliance on third-party services.
                </p>
             </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey}
              onChange={(e) => {
                  setLocalConfig({ ...localConfig, apiKey: e.target.value });
                  setValidationError(null);
              }}
              placeholder={localConfig.provider === 'gemini' ? "Optional (Uses default free key)" : "sk-..."}
              className={`w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors placeholder-gray-400 dark:placeholder-zinc-500 ${
                  validationError ? 'border-red-500/50' : 'border-gray-200 dark:border-zinc-700'
              }`}
            />
            {localConfig.provider === 'gemini' && !localConfig.apiKey && (
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-2">Using SteadyCoach internal key</p>
            )}
            {validationError && (
                <div className="flex items-center text-red-500 dark:text-red-400 text-xs mt-2 animate-fade-in font-medium">
                    <AlertCircle size={14} className="mr-1.5" />
                    {validationError}
                </div>
            )}
            
            {/* Security Disclaimer */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-start gap-3">
                <Shield size={16} className="text-gray-400 dark:text-zinc-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-gray-500 dark:text-zinc-400 leading-relaxed">
                    <strong className="block text-gray-700 dark:text-zinc-300 mb-1">API Credentials & Privacy</strong>
                    <p className="mb-2">API credentials are stored locally on this device only. They are never transmitted to or accessible by the developer.</p>
                    <p className="text-gray-400 dark:text-zinc-500">You may remove or replace credentials at any time. Removal immediately disables third-party access.</p>
                </div>
            </div>
          </div>

          {localConfig.provider !== 'gemini' && (
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Base URL</label>
                <input
                type="text"
                value={localConfig.baseUrl}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
                />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Model</label>
            <input
              type="text"
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-zinc-700/50 flex justify-end bg-white dark:bg-[#18181b] sticky bottom-0 z-10">
          <button
            onClick={handleSave}
            disabled={
                isValidating || 
                (!localConfig.apiKey && localConfig.provider !== 'custom' && localConfig.provider !== 'gemini')
            }
            className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-950 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isValidating && <Loader2 size={16} className="animate-spin" />}
            <span>{isValidating ? 'Verifying...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};