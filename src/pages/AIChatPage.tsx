import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Conversation, ChatMessage } from '../types/index.ts';
import {
  Send,
  Plus,
  Trash2,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Compass,
  Code2,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';

interface AIChatPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

const SUGGESTED_PROMPTS = [
  'Which career is best for me?',
  'What skills am I missing for placements?',
  'Create a 6-month AI/ML roadmap.',
  'What should I learn this week?',
  'Suggest projects for my skill level.',
  'Am I ready for campus placements?',
  'How can I improve my resume for ATS?',
  'Prepare me for a technical interview.'
];

export const AIChatPage: React.FC<AIChatPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const res = await api.getChatHistory();
      setConversations(res.conversations);
      if (res.conversations.length > 0) {
        setActiveConvId(res.conversations[0].id);
        setMessages(res.conversations[0].messages);
      } else {
        startNewConversation();
      }
    } catch (err) {
      console.warn('Failed to load chat history:', err);
    }
  };

  const startNewConversation = () => {
    setActiveConvId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.name || 'there'}! I am **CareerAI**, your personalized Career Copilot.\n\nI have reviewed your academic profile in **${user?.degree || 'Engineering'} (${user?.branch || 'CSE'})** and target role in **${user?.targetCareer || 'Software'}**.\n\nHow can I help accelerate your placement readiness today? You can choose a quick question below or ask anything specific!`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    try {
      const res = await api.getConversation(convId);
      setMessages(res.conversation.messages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        startNewConversation();
      }
    } catch (err) {
      console.error('Delete conv error:', err);
    }
  };

  const handleClearConversation = async () => {
    if (!activeConvId) {
      startNewConversation();
      return;
    }
    try {
      await api.clearConversation(activeConvId);
      startNewConversation();
    } catch (err) {
      console.error('Clear conv error:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const tempUserMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(text, activeConvId || undefined);
      if (!activeConvId) {
        setActiveConvId(res.conversationId);
      }
      setMessages(res.conversation.messages);
      // Refresh conversation list
      const hist = await api.getChatHistory();
      setConversations(hist.conversations);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `I encountered an issue processing your query: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(id);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Simple Markdown renderer
  const renderMessageContent = (content: string, msgId: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-slate-800/80">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg font-bold text-white pt-2 pb-1 border-b border-slate-800">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl font-bold text-white pt-2 pb-1">
                {line.replace('# ', '')}
              </h1>
            );
          }

          // Bullet points
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const text = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{renderInlineFormatting(text)}</span>
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-mono text-indigo-400 font-semibold">{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Empty line
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          return <p key={idx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={pIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Chat Sidebar (Conversations) */}
      <div className="w-72 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button
            onClick={startNewConversation}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" /> New Conversation
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            Recent Consultations
          </div>
          {conversations.length === 0 ? (
            <div className="text-xs text-slate-400 p-3 italic">No previous chats. Start one above!</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-slate-900 text-white border border-slate-800'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <div className="truncate flex-1 pr-2">{conv.title}</div>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Student Context Footer */}
        <div className="p-3 border-t border-slate-900 bg-slate-900/30 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Profile Aware
          </div>
          <div>Target: <span className="text-slate-300 font-medium">{user?.targetCareer || 'AI/ML Engineer'}</span></div>
          <div>Verified: <span className="text-slate-300">{(user?.skills || []).length} skills loaded</span></div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                CareerAI
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-normal">
                  Placement Mentor
                </span>
              </div>
              <div className="text-[11px] text-slate-400">Contextual answers grounded in your profile</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearConversation}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-xs flex items-center gap-1"
              title="Clear current messages"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 sm:p-5 shadow-sm ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    renderMessageContent(msg.content, msg.id)
                  )}
                  <div className={`mt-2 text-[10px] ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-2xl mr-auto">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl p-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-tl-none flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
                <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-300" />
                <span className="text-xs ml-2">CareerAI is reasoning...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Bar */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60 overflow-x-auto">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Suggested queries:</div>
            <div className="flex gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="shrink-0 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CareerAI about skills, roadmaps, projects, interviews..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="text-[11px] text-slate-400 text-center mt-2">
            CareerAI provides tailored educational advice based on your current skill profile.
          </div>
        </div>
      </div>
    </div>
  );
};
