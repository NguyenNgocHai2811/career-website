import React, { useState, useRef, useEffect } from 'react';

const GEMINI_URL = 'https://gemini.google.com/app';
const CHATGPT_URL = 'https://chatgpt.com/';

const ContextExporter = ({ contextText }) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  // Scroll into view when context appears
  useEffect(() => {
    if (contextText && containerRef.current) {
      setTimeout(() => {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    }
  }, [contextText]);

  if (!contextText) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contextText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = contextText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="mt-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 career-ai-msg-enter"
    >
      <p className="text-sm font-bold text-violet-700 dark:text-violet-400 mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
        Muốn tìm hiểu sâu hơn?
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Sao chép ngữ cảnh cuộc trò chuyện này và hỏi tiếp với AI bên ngoài để nhận tư vấn chuyên sâu hơn.
      </p>

      {/* Context preview */}
      <div className="bg-white dark:bg-[#1e293b] rounded-xl p-3 mb-4 border border-violet-100 dark:border-violet-800/50 max-h-28 overflow-y-auto">
        <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-sans leading-relaxed">
          {contextText}
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${copied
              ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md shadow-violet-500/20'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? 'check_circle' : 'content_copy'}
          </span>
          {copied ? 'Đã sao chép!' : 'Sao chép ngữ cảnh'}
        </button>

        <a
          href={GEMINI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Mở Gemini
        </a>

        <a
          href={CHATGPT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm font-bold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors no-underline"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Mở ChatGPT
        </a>
      </div>
    </div>
  );
};

export default ContextExporter;
