import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'sonner';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  BookOpen,
  Rocket,
  Award,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';

const QUICK_PROMPTS = [
  { label: 'Why am I weak in Node.js?', text: 'Why am I weak in Node.js?' },
  { label: 'What should I study next?', text: 'What should I study next?' },
  { label: 'Why did I fail this assessment?', text: 'Why did I fail this assessment?' },
  { label: 'Give me practice for SQL joins', text: 'Give me practice for SQL joins.' },
  { label: 'Explain this coding error', text: 'Explain this coding error.' },
];

const AIMentor = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [learnerContext, setLearnerContext] = useState(null);
  const [contextDrawerOpen, setContextDrawerOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial Load: Fetch Context & Conversations
  useEffect(() => {
    const init = async () => {
      try {
        const [ctxRes, convsRes] = await Promise.all([
          API.get('/mentor/context').catch(() => ({ data: { context: null } })),
          API.get('/mentor/conversations').catch(() => ({ data: { conversations: [] } })),
        ]);

        setLearnerContext(ctxRes.data.context);
        const convList = convsRes.data.conversations || [];
        setConversations(convList);

        if (convList.length > 0) {
          // Load latest conversation
          loadConversation(convList[0].id);
        } else {
          // Create welcome message
          setMessages([
            {
              role: 'assistant',
              content: `Hello **${ctxRes.data.context?.learner?.name || 'Scholar'}**! I am **NOVA AI Mentor**, your personal engineering advisor.\n\nI am synchronized with your live academic records, target role benchmarks, and coding submissions. How can I help you level up your engineering competencies today?`,
              timestamp: new Date(),
              structuredRecommendations: [],
            },
          ]);
        }
      } catch (err) {
        console.error('AI Mentor init error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  // Load a specific conversation
  const loadConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    try {
      const res = await API.get(`/mentor/conversations/${conversationId}`);
      if (res.data.conversation?.messages) {
        setMessages(res.data.conversation.messages);
      }
    } catch (err) {
      toast.error('Failed to load conversation history.');
    }
  };

  // Start a fresh conversation session
  const handleStartNewSession = () => {
    setActiveConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: `Started a fresh mentorship thread. Ask me anything regarding your skill gaps, active curriculum, coding challenges, or technical errors.`,
        timestamp: new Date(),
        structuredRecommendations: [],
      },
    ]);
    if (inputRef.current) inputRef.current.focus();
  };

  // Delete Conversation
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await API.delete(`/mentor/conversations/${convId}`);
      toast.info('Conversation deleted.');
      const updated = conversations.filter((c) => c.id !== convId);
      setConversations(updated);
      if (activeConversationId === convId) {
        handleStartNewSession();
      }
    } catch (err) {
      toast.error('Could not delete conversation.');
    }
  };

  // Send message
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    setInputValue('');

    // Optimistically append user message
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
        conversationId: activeConversationId,
      });

      if (res.data.conversationId && !activeConversationId) {
        setActiveConversationId(res.data.conversationId);
        // Refresh conversations list
        const convsRes = await API.get('/mentor/conversations');
        setConversations(convsRes.data.conversations || []);
      }

      setMessages((prev) => [...prev, res.data.message]);
    } catch (err) {
      const status = err.response?.status;
      const errMsg =
        status === 429
          ? 'Rate limit reached: Please wait a moment before sending more queries to the AI Mentor.'
          : err.response?.data?.message || 'Failed to receive mentor guidance.';

      toast.error(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Service Notice:** ${errMsg}`,
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

  if (initialLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton variant="card" className="h-24 bg-slate-900/60" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton variant="card" className="h-[650px] lg:col-span-1 bg-slate-900/60" />
          <Skeleton variant="card" className="h-[650px] lg:col-span-3 bg-slate-900/60" />
        </div>
      </div>
    );
  }

  const role = learnerContext?.targetRole;
  const weakSkills = learnerContext?.weakSkills || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>NOVA AI Mentor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                Grounded in Real Telemetry
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Personalized engineering mentorship referencing your actual database submissions &amp; skill scores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Target Role Pill */}
          {role && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
              <span className="text-slate-400">Target Role:</span>
              <span className="font-bold text-cyan-400">{role.name}</span>
              <span className="font-mono text-emerald-400">({role.roleReadinessScore}% ready)</span>
            </div>
          )}

          <button
            onClick={() => setContextDrawerOpen(!contextDrawerOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Learner Telemetry</span>
          </button>

          <button
            onClick={handleStartNewSession}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout (Sidebar + Chat Area) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sessions Sidebar */}
        <aside className="w-72 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Past Mentorship Sessions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No past sessions recorded. Start a new conversation to ask questions!
              </div>
            ) : (
              conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={`p-3 rounded-xl cursor-pointer text-xs transition-all flex items-center justify-between group ${
                    activeConversationId === c.id
                      ? 'bg-indigo-600/20 border border-indigo-500/50 text-white font-semibold'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="truncate">{c.title}</h4>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {new Date(c.updatedAt).toLocaleDateString()} • {c.messageCount} msgs
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    title="Delete thread"
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Target Gaps Card in Sidebar */}
          {weakSkills.length > 0 && (
            <div className="p-3.5 m-3 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                Target Competency Gaps
              </span>
              <div className="space-y-1">
                {weakSkills.slice(0, 3).map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 truncate max-w-[130px]">{w.skillName}</span>
                    <span className="font-mono text-rose-400 font-bold">{w.overallScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Central Chat Stream */}
        <main className="flex-1 flex flex-col bg-slate-950 min-w-0 relative">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg._id || index}
                  className={`flex gap-3 max-w-4xl ${
                    isAssistant ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                      isAssistant
                        ? 'bg-gradient-to-br from-cyan-600 to-indigo-600 shadow-md shadow-cyan-600/20'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-5 h-5" /> : <span className="font-bold text-xs">YOU</span>}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-3 min-w-0 max-w-2xl">
                    <div
                      className={`p-4 md:p-5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-lg'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans space-y-2">
                        {msg.content}
                      </div>
                    </div>

                    {/* Structured Recommendations Card (Mandatory 4-Step Roadmap) */}
                    {isAssistant && msg.structuredRecommendations?.length > 0 && (
                      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                        <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-400 uppercase tracking-wider">
                          <Rocket className="w-4 h-4" />
                          Recommended Remediation Path
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.structuredRecommendations.map((rec, rIdx) => {
                            const iconMap = {
                              concept_review: <BookOpen className="w-4 h-4 text-emerald-400" />,
                              practice: <Terminal className="w-4 h-4 text-cyan-400" />,
                              practical_task: <Rocket className="w-4 h-4 text-indigo-400" />,
                              reassessment: <Award className="w-4 h-4 text-amber-400" />,
                            };

                            const labelMap = {
                              concept_review: '1. Concept Review',
                              practice: '2. Practice',
                              practical_task: '3. Practical Task',
                              reassessment: '4. Reassessment',
                            };

                            return (
                              <div
                                key={rIdx}
                                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase">
                                    {iconMap[rec.type] || <CheckCircle2 className="w-4 h-4" />}
                                    <span>{labelMap[rec.type] || rec.type}</span>
                                  </div>
                                  <h5 className="font-bold text-xs text-white line-clamp-1">
                                    {rec.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-400 line-clamp-2">
                                    {rec.description}
                                  </p>
                                </div>

                                {rec.link && (
                                  <Link
                                    to={rec.link}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 pt-1"
                                  >
                                    <span>Open Resource</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </Link>
                                )}
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

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 max-w-2xl mr-auto">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Synthesizing database telemetry &amp; generating guidance...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold shrink-0">
              Suggested:
            </span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp.text)}
                disabled={loading}
                className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs shrink-0 transition-all font-medium active:scale-95"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3 max-w-4xl mx-auto"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NOVA AI Mentor (e.g. 'Why am I weak in Node.js?', 'What should I study next?')..."
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 focus:border-cyan-500 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-md shadow-cyan-600/20 active:scale-95 shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </main>

        {/* Right Learner Telemetry Drawer */}
        {contextDrawerOpen && (
          <aside className="w-80 bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto space-y-5 animate-slideLeft shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Live Telemetry Provenance
              </h3>
              <button
                onClick={() => setContextDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              The AI Mentor directly accesses the following database records to generate grounded responses without guessing.
            </p>

            {/* Target Role Card */}
            {role && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                  Active Career Goal
                </span>
                <h4 className="font-bold text-white text-sm">{role.name}</h4>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Role Readiness:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {role.roleReadinessScore}%
                  </span>
                </div>
              </div>
            )}

            {/* Demonstrated Skills Snapshot */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Demonstrated Skills ({learnerContext?.demonstratedSkills?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(learnerContext?.demonstratedSkills || []).map((sk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 font-medium truncate max-w-[140px]">
                      {sk.skillName}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        sk.overallScore >= 75
                          ? 'text-emerald-400'
                          : sk.overallScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {sk.overallScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Enrolled Curricula */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Active Courses
              </span>
              <div className="space-y-1.5">
                {(learnerContext?.activeCourses || []).slice(0, 3).map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300 truncate max-w-[150px]">{c.title}</span>
                    <span className="font-mono text-cyan-400">{c.completionPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AIMentor;
