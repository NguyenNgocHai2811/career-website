import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import ChatBubble from '../../components/CareerAI/ChatBubble';
import OptionChips from '../../components/CareerAI/OptionChips';
import ResultCard from '../../components/CareerAI/ResultCard';
import ContextExporter from '../../components/CareerAI/ContextExporter';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const QUICK_STARTS = [
  'Tôi thích làm việc với công nghệ và máy tính',
  'Tôi thích giao tiếp, kết nối với mọi người',
  'Tôi giỏi sáng tạo, vẽ và thiết kế',
  'Tôi thích nghiên cứu, phân tích dữ liệu',
  'Tôi muốn giúp đỡ người khác và cộng đồng',
];

const TypingIndicator = () => (
  <div className="flex items-end gap-3 career-ai-msg-enter">
    <div className="size-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
      <span className="material-symbols-outlined text-[18px]">psychology</span>
    </div>
    <div className="bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm">
      <div className="flex gap-1.5 items-center h-5">
        <span className="size-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="size-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="size-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  </div>
);

const CareerAI = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [exportContext, setExportContext] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, loading, suggestions, exportContext]);

  // Focus input after AI responds
  useEffect(() => {
    if (!loading && started && !suggestions) {
      inputRef.current?.focus();
    }
  }, [loading, started, suggestions]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setCurrentOptions([]);
    setLoading(true);
    setStarted(true);
    setError('');

    const newHistory = [...conversationHistory, userMsg];

    try {
      const res = await fetch(`${API_BASE}/v1/ai/career-predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text.trim(), conversationHistory })
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'AI không phản hồi được.');

      const aiData = json.data;
      const aiMsg = { role: 'model', text: aiData.message };

      setMessages(prev => [...prev, aiMsg]);
      setConversationHistory([...newHistory, aiMsg]);

      if (aiData.type === 'options' && aiData.options?.length > 0) {
        setCurrentOptions(aiData.options);
      }

      if (aiData.type === 'result' && aiData.suggestions?.length > 0) {
        setSuggestions(aiData.suggestions);
        setCurrentOptions([]);
      }
    } catch (err) {
      const errMsg = err.message || 'Đã xảy ra lỗi kết nối.';
      setError(errMsg);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `⚠️ ${errMsg}`,
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOptions(prev => [...prev, option]);
    sendMessage(option);
  };

  const handleExport = async (targetCareer) => {
    try {
      const res = await fetch(`${API_BASE}/v1/ai/export-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selectedOptions, suggestions: suggestions || [], targetCareer })
      });
      const json = await res.json();
      if (json.success) setExportContext(json.data.contextText);
    } catch {
      setExportContext('Không thể tải ngữ cảnh. Vui lòng thử lại.');
    }
  };

  const handleReset = () => {
    setMessages([]);
    setConversationHistory([]);
    setSelectedOptions([]);
    setCurrentOptions([]);
    setSuggestions(null);
    setExportContext('');
    setInput('');
    setStarted(false);
    setError('');
  };

  const retryLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      // Remove the error message
      setMessages(prev => prev.filter(m => !m.isError));
      setError('');
      sendMessage(lastUserMsg.text);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col">
      <AppHeader activeTab="career-ai" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Hero Banner */}
        {!started && (
          <div className="career-ai-hero rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8 text-center shadow-xl relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 size-40 bg-white/5 rounded-full"></div>
            <div className="absolute -bottom-8 -left-8 size-32 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 size-20 bg-white/5 rounded-full"></div>

            <div className="relative z-10">
              <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="material-symbols-outlined text-[36px]">psychology</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Khám phá nghề nghiệp cùng AI</h1>
              <p className="text-violet-200 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
                Chưa biết mình phù hợp với ngành nào? Hãy bắt đầu bằng cách mô tả bản thân — AI sẽ dẫn dắt bạn từng bước để tìm ra hướng đi phù hợp nhất.
              </p>

              {/* Quick start chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {QUICK_STARTS.map((qs, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(qs)}
                    disabled={loading}
                    className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white text-xs md:text-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {qs}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div key={idx} className="career-ai-msg-enter">
                <ChatBubble role={msg.role} text={msg.text} isError={msg.isError} />
                {/* Show option chips after last AI message */}
                {msg.role === 'model' && idx === messages.length - 1 && !loading && currentOptions.length > 0 && (
                  <OptionChips
                    options={currentOptions}
                    onSelect={handleOptionSelect}
                    disabled={loading}
                  />
                )}
              </div>
            ))}

            {/* Retry button on error */}
            {error && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={retryLastMessage}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  Thử lại
                </button>
              </div>
            )}

            {loading && <TypingIndicator />}
          </div>
        )}

        {/* Result Cards */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-2 career-ai-msg-enter">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Gợi ý nghề nghiệp phù hợp với bạn
            </p>
            <div className="grid gap-4">
              {suggestions.map((s, i) => (
                <ResultCard key={i} suggestion={s} onExport={handleExport} index={i} />
              ))}
            </div>
            <ContextExporter contextText={exportContext} />

            {/* Restart button */}
            <button
              onClick={handleReset}
              className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-slate-500 text-sm font-semibold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Khám phá lại từ đầu
            </button>
          </div>
        )}

        <div ref={bottomRef} />

        {/* Input Bar */}
        {!suggestions && (
          <div className="sticky bottom-4 mt-auto">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-lg"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                placeholder={started ? 'Tiếp tục mô tả hoặc chọn một gợi ý ở trên...' : 'Ví dụ: Tôi học giỏi toán, thích làm việc một mình...'}
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 px-3 py-2 disabled:opacity-50"
              />
              <div className="flex items-center gap-2 pr-1">
                <span className={`text-xs tabular-nums ${input.length > 450 ? 'text-red-400 font-bold' : 'text-slate-400'} hidden sm:inline`}>
                  {input.length}/500
                </span>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">{loading ? 'hourglass_empty' : 'send'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerAI;
