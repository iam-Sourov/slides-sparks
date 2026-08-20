import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Settings, Send, Key, Check, AlertCircle, RefreshCw, Layers, Play } from 'lucide-react';
import { AIConfig, PROVIDERS, generateOrEditSlide, fetchAvailableModels, testModelConnection } from '../services/aiService';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySlide: (code: string, mode: 'create' | 'edit') => void;
  currentSlideCode?: string;
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const SUGGESTIONS = [
  { text: 'Create a dark keynote title slide about quantum computing', icon: '🪄' },
  { text: 'Create a comparative analysis slide of SQL vs NoSQL databases', icon: '📊' },
  { text: 'Create a sleek dark timeline showing a Q3 2026 roadmap', icon: '📅' },
  { text: 'Modify active slide background to a glowing deep violet gradient', icon: '🎨', forEdit: true },
  { text: 'Add a prominent metric section showing 99.9% availability', icon: '📈', forEdit: true }
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onApplySlide,
  currentSlideCode,
  config,
  onConfigChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<AIConfig['provider']>(config.provider);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [customBaseUrl, setCustomBaseUrl] = useState(config.customBaseUrl || '');
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // States for dynamic model list and connection testing
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>(PROVIDERS[config.provider].models);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'failed' | null; message: string | null }>({
    status: null,
    message: null
  });

  // Sync settings when props change
  useEffect(() => {
    setProvider(config.provider);
    setApiKey(config.apiKey);
    setModel(config.model);
    setCustomBaseUrl(config.customBaseUrl || '');
  }, [config]);

  // Sync default model when provider changes
  useEffect(() => {
    const defaultModel = PROVIDERS[provider].defaultModel;
    setModel(defaultModel);
    setAvailableModels(PROVIDERS[provider].models);
    setTestResult({ status: null, message: null });
  }, [provider]);

  // Fetch authorized models silently if API key is present
  useEffect(() => {
    if (apiKey.trim()) {
      handleFetchModels(true);
    }
  }, [provider, apiKey]);

  // Loading animation intervals
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Scroll window to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isGenerating]);

  // Welcome message initialization
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hi! I'm your slide generation agent. I can create a new slide from scratch or modify the selected slide in real-time. Make sure your API key is configured, and let me know what you would like to design!`,
          timestamp: new Date()
        }
      ]);
    }
  }, [chatHistory]);

  const handleFetchModels = async (silent = false) => {
    if (!apiKey.trim()) return;
    if (!silent) setIsFetchingModels(true);
    setError(null);
    try {
      const models = await fetchAvailableModels({
        provider,
        apiKey: apiKey.trim(),
        customBaseUrl: customBaseUrl.trim() || undefined
      });
      setAvailableModels(models);
      
      // Auto-select first fetched model if current selection isn't available
      if (models.length > 0 && !models.some(m => m.id === model)) {
        setModel(models[0].id);
      }
    } catch (e: any) {
      if (!silent) {
        setError(`Failed to fetch models: ${e.message}`);
      }
    } finally {
      if (!silent) setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setError('Please provide an API key first.');
      return;
    }
    setIsTestingConnection(true);
    setTestResult({ status: null, message: null });
    setError(null);
    try {
      await testModelConnection({
        provider,
        apiKey: apiKey.trim(),
        model,
        customBaseUrl: customBaseUrl.trim() || undefined
      });
      setTestResult({
        status: 'success',
        message: 'Connection successful! This model is active and responsive for your API key.'
      });
    } catch (e: any) {
      setTestResult({
        status: 'failed',
        message: e.message || 'Connection test failed.'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('An API key is required.');
      return;
    }
    setError(null);
    onConfigChange({
      provider,
      apiKey: apiKey.trim(),
      model,
      customBaseUrl: customBaseUrl.trim() || undefined
    });
    setShowSettings(false);
    
    setChatHistory(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: `Configuration saved successfully! I am now connected to ${PROVIDERS[provider].name} using ${model}. Let's build some slides!`,
        timestamp: new Date()
      }
    ]);
  };

  const handleSendPrompt = async (selectedPrompt?: string) => {
    const promptText = (selectedPrompt || prompt).trim();
    if (!promptText) return;
    if (!config.apiKey) {
      setShowSettings(true);
      setError('An API key is required before prompting.');
      return;
    }

    const activeMode = selectedPrompt 
      ? (SUGGESTIONS.find(s => s.text === selectedPrompt)?.forEdit ? 'edit' : 'create')
      : mode;

    if (activeMode === 'edit' && !currentSlideCode) {
      setError('Please select a slide in the sidebar before attempting to modify it.');
      return;
    }

    setError(null);
    if (!selectedPrompt) setPrompt('');

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: promptText,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsGenerating(true);
    setLoadingStep(0);

    try {
      const result = await generateOrEditSlide(
        promptText,
        activeMode,
        currentSlideCode,
        config
      );

      onApplySlide(result, activeMode);

      setChatHistory(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: `Here is the ${activeMode === 'edit' ? 'modified' : 'new'} slide layout I designed for you. You can see the result in the preview canvas and edit the code directly if needed!`,
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: `An error occurred: ${err.message || 'Unknown network error. Check your credentials/API proxy.'}`,
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadingMessages = [
    'Synthesizing layout grid...',
    'Writing custom style declarations...',
    'Injecting Tailwind components...',
    'Selecting Lucide & FontAwesome icons...',
    'Reviewing slide geometry ratios...',
    'Finalizing presentation assets...'
  ];

  if (!isOpen) return null;

  return (
    <div className="w-[380px] bg-slate-950 border-l border-slate-850 flex flex-col h-full animate-in slide-in-from-right duration-250 shrink-0">
      {/* Thinner h-14 Header */}
      <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="font-bold text-sm text-slate-100">AI Slide Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg border transition-all ${
              showSettings 
                ? 'bg-slate-900 border-slate-700 text-white' 
                : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Panel View */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col relative min-h-0 bg-slate-950">
        {showSettings ? (
          /* Credentials Form */
          <form onSubmit={handleSaveSettings} className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Select Provider</span>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PROVIDERS) as Array<keyof typeof PROVIDERS>).map((provKey) => (
                  <button
                    key={provKey}
                    type="button"
                    onClick={() => setProvider(provKey)}
                    className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                      provider === provKey
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {PROVIDERS[provKey].name.split(' ')[1] || PROVIDERS[provKey].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span>API Key</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${PROVIDERS[provider].name} API Key`}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400">Model</label>
                <button
                  type="button"
                  onClick={() => handleFetchModels()}
                  disabled={isFetchingModels || !apiKey.trim()}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-all disabled:opacity-40 flex items-center gap-1"
                >
                  {isFetchingModels ? (
                    <>
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <span>Fetch Authorized Models</span>
                  )}
                </button>
              </div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Custom Base URL (Optional)</label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="E.g., https://api.openai.com"
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none transition-all font-mono"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Override the endpoint URL to use custom API gateways or local CORS bypass proxies.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Test result container */}
            {testResult.status && (
              <div className={`flex items-start gap-2 border p-3 rounded-lg text-xs ${
                testResult.status === 'success'
                  ? 'text-emerald-400 bg-emerald-950/15 border-emerald-900/30'
                  : 'text-red-400 bg-red-950/15 border-red-900/30'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed whitespace-pre-wrap">{testResult.message}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingConnection || !apiKey.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 rounded-lg font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-40"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-slate-450" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-200 text-slate-950 rounded-lg font-bold text-xs transition-all active:scale-[0.98]"
              >
                <Check className="w-3.5 h-3.5" /> Save Config
              </button>
            </div>
          </form>
        ) : (
          /* Agent Chatbox View */
          <div className="flex-1 flex flex-col justify-between min-h-0 space-y-4">
            {/* Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 no-scrollbar min-h-0">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {msg.sender === 'assistant' ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm">
                      AI
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[10px] font-bold text-slate-350 shrink-0">
                      U
                    </div>
                  )}

                  {/* Bubble content */}
                  <div
                    className={`max-w-[78%] text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900/80 border border-slate-800/80 text-slate-100 rounded-2xl rounded-tr-none px-3.5 py-2.5'
                        : msg.isError
                        ? 'text-red-400 bg-red-950/15 border border-red-900/30 rounded-2xl px-3.5 py-2.5'
                        : 'text-slate-300 px-1 py-1'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-[9px] text-slate-500 mt-1 block font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isGenerating && (
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm animate-pulse">
                    AI
                  </div>
                  <div className="bg-slate-900/50 border border-slate-850 rounded-2xl px-4 py-3 text-xs text-slate-400 max-w-[78%] flex flex-col gap-2 shadow-sm animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                      <span className="font-bold text-[9px] text-indigo-400 font-mono tracking-wider uppercase">
                        Designing Slide...
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-455">{loadingMessages[loadingStep]}</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions list */}
            {!isGenerating && chatHistory.length <= 2 && (
              <div className="space-y-1.5 pt-2.5 border-t border-slate-900">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono block">
                  Quick Actions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendPrompt(suggestion.text)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] transition-all hover:scale-[1.01] active:scale-[0.99] font-medium"
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.text.substring(0, 42)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating ChatGPT/Claude Style Input Area */}
      {!showSettings && (
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-3">
          {/* Key missing warning */}
          {!config.apiKey && (
            <div className="flex items-center justify-between p-2.5 bg-amber-950/20 border border-amber-900/30 rounded-lg text-amber-300 text-[11px]">
              <span>Configure your credentials to activate the agent.</span>
              <button
                onClick={() => setShowSettings(true)}
                className="underline hover:text-white font-bold font-mono"
              >
                Configure
              </button>
            </div>
          )}

          {/* Unified Prompt Input Box Container */}
          <div className="bg-slate-900 border border-slate-800 focus-within:border-slate-700 rounded-xl p-2.5 flex flex-col transition-all">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating || !config.apiKey}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              placeholder={
                !config.apiKey 
                  ? 'Input credentials to begin...' 
                  : mode === 'edit'
                  ? 'Describe details to modify on the current slide...' 
                  : 'Describe the slide content and style you want...'
              }
              className="w-full bg-transparent text-xs text-slate-200 focus:outline-none resize-none leading-relaxed placeholder-slate-550 border-0 p-1 pr-8 no-scrollbar"
            />
            
            {/* Input Options Row inside prompt box */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-850/80">
              <div className="flex items-center gap-1.5">
                {/* Mode Selector */}
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800/80">
                  <button
                    onClick={() => setMode('create')}
                    type="button"
                    disabled={isGenerating}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                      mode === 'create'
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setMode('edit')}
                    type="button"
                    disabled={isGenerating || !currentSlideCode}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                      mode === 'edit'
                        ? 'bg-slate-800 text-slate-100'
                        : 'text-slate-455 hover:text-slate-350 disabled:opacity-30'
                    }`}
                  >
                    Modify Active
                  </button>
                </div>

                {/* Model badge */}
                {config.apiKey && (
                  <span className="text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-850 px-2 py-1 rounded-lg">
                    {config.model.split('-').slice(0, 3).join('-')}
                  </span>
                )}
              </div>

              {/* Submit trigger button */}
              <button
                onClick={() => handleSendPrompt()}
                disabled={isGenerating || !prompt.trim() || !config.apiKey}
                className="p-1.5 bg-slate-50 hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-600 text-slate-950 rounded-lg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
