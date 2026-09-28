import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'sonner';
import {
  Bot,
  Send,
  Sparkles,
  Maximize2,
  X,
  RefreshCw,
  BookOpen,
  Terminal,
  Rocket,
  Award,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Why am I weak in my core skills?',
  'What should I practice next?',
  'Explain my next action',
];

const FloatingAIMentor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [learnerContext, setLearnerContext] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  // Load Context lazily when mentor widget is opened (prevents blocking student page loads)
  useEffect(() => {
    if (!isOpen || learnerContext) return;
    let isMounted = true;
    const fetchContext = async () => {
      try {
        const res = await API.get('/mentor/context');
        if (isMounted && res.data?.context) {
          setLearnerContext(res.data.context);
          if (messages.length === 0) {
            const studentName = res.data.context.learner?.name || 'Scholar';
            const weakCount = res.data.context.weakSkills?.length || 0;
            const weakNotice =
              weakCount > 0
                ? ` I noticed ${weakCount} competency area${weakCount > 1 ? 's' : ''} we can strengthen today.`
                : ' All your tracked skills are currently meeting benchmark thresholds!';

            setMessages([
              {
                role: 'assistant',
                content: `Hi **${studentName}**! I'm your **NOVA AI Mentor**.${weakNotice}\n\nAsk me anything about your active courses, coding labs, assignments, or career milestones.`,
                timestamp: new Date(),
                structuredRecommendations: [],
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch AI Mentor context for floating widget:', err.message);
      }
    };

    fetchContext();
    return () => {
      isMounted = false;
    };
  }, [isOpen, learnerContext]);

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setInputValue('');

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await API.post('/mentor/chat', {
        message: text,
        conversationId,
      });

      if (res.data.conversationId && !conversationId) {
        setConversationId(res.data.conversationId);
      }

      setMessages((prev) => [...prev, res.data.message]);
    } catch (err) {
      const status = err.response?.status;
      const errMsg =
        status === 429
          ? 'Rate limit reached: Please wait a moment before sending more queries.'
          : err.response?.data?.message || 'Unable to receive guidance from AI Mentor right now.';

      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Notice:** ${errMsg}`,
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    navigate('/student/mentor');
  };

  // If already on full-page AI Mentor, do not render duplicate floating widget
  if (location.pathname === '/student/mentor') {
    return null;
  }

  return (
    <>
      {/* ================= FLOATING CHAT WINDOW ================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="NOVA AI Mentor Floating Assistant"
          className="fixed bottom-24 right-4 sm:right-6 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-7.5rem)] z-50 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3 text-white flex items-center justify-between border-b border-indigo-500/20">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs tracking-tight">NOVA AI Mentor</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-cyan-500/20 border border-cyan-400/30 text-cyan-300">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Telemetry Synced
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleOpenFullPage}
                title="Open full page view"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close AI Mentor"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${isAssistant ? 'text-left' : 'text-right'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAssistant
                          ? msg.isError
                            ? 'bg-rose-50 border border-rose-200 text-rose-800'
                            : 'bg-white border border-slate-200/90 text-slate-800 shadow-sm'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    </div>

                    {/* Structured Recommendations Card */}
                    {isAssistant && msg.structuredRecommendations?.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-[10px] text-indigo-700 uppercase tracking-wider">
                          <Rocket className="w-3.5 h-3.5" />
                          Remediation Plan
                        </div>
                        <div className="space-y-1.5">
                          {msg.structuredRecommendations.map((rec, rIdx) => {
                            const iconMap = {
                              concept_review: <BookOpen className="w-3 h-3 text-emerald-600" />,
                              practice: <Terminal className="w-3 h-3 text-cyan-600" />,
                              practical_task: <Rocket className="w-3 h-3 text-indigo-600" />,
                              reassessment: <Award className="w-3 h-3 text-amber-600" />,
                            };
                            return (
                              <div
                                key={rIdx}
                                className="p-2 rounded-lg bg-white border border-slate-200 flex flex-col gap-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
                                    {iconMap[rec.type] || <Sparkles className="w-3 h-3" />}
                                    <span>{rec.title}</span>
                                  </div>
                                  {rec.link && (
                                    <Link
                                      to={rec.link}
                                      onClick={() => setIsOpen(false)}
                                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                                    >
                                      <span>Go</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </Link>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2">
                                  {rec.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/90 text-slate-500 text-xs shadow-sm flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Synthesizing verified recommendation...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about skills, code, or courses..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                title="Send message"
                className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400 px-1 font-mono">
              <span>Press Enter ↵ to send</span>
              <span className="text-cyan-600 font-semibold">NOVA AI Telemetry Active</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING CIRCULAR TRIGGER BUTTON ================= */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close AI Mentor' : 'Open AI Mentor'}
          title={isOpen ? 'Close AI Mentor' : 'Ask AI Mentor'}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 scale-95 shadow-slate-900/40'
              : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 hover:scale-105 active:scale-95 shadow-[0_4px_24px_rgba(37,99,235,0.45)] hover:shadow-[0_6px_32px_rgba(37,99,235,0.65)]'
          }`}
        >
          {/* Subtle Outer Glowing Ring Animation */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 opacity-40 blur-sm animate-pulse"></span>
          )}

          {/* Active Status Beacon */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </span>
          )}

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 transition-transform duration-200" />
            ) : (
              <Bot className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            )}
          </div>
        </button>

        {/* Floating Tooltip Pill (Hover) */}
        {!isOpen && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg border border-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Ask AI Mentor</span>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingAIMentor;
