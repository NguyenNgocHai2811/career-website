import React from 'react';

/**
 * Minimal markdown-like formatting: bold, italic, line breaks, bullet lists.
 * Does NOT use dangerouslySetInnerHTML — returns React elements.
 */
const formatText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Bullet list items
    const bulletMatch = line.match(/^[-•]\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={lineIdx} className="flex gap-2 items-start ml-1">
          <span className="text-violet-400 mt-0.5 shrink-0">•</span>
          <span>{formatInline(bulletMatch[1])}</span>
        </div>
      );
    }

    // Numbered list items
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lineIdx} className="flex gap-2 items-start ml-1">
          <span className="text-violet-400 font-bold mt-0.5 shrink-0">{numMatch[1]}.</span>
          <span>{formatInline(numMatch[2])}</span>
        </div>
      );
    }

    // Empty line = paragraph break
    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return <div key={lineIdx}>{formatInline(line)}</div>;
  });
};

/**
 * Inline formatting: **bold** and *italic*
 */
const formatInline = (text) => {
  if (!text) return null;

  // Split by **bold** and *italic* patterns
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text* (not preceded by *)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    let nextMatch = null;
    let type = null;

    if (boldMatch && (!italicMatch || boldMatch.index <= italicMatch.index)) {
      nextMatch = boldMatch;
      type = 'bold';
    } else if (italicMatch) {
      nextMatch = italicMatch;
      type = 'italic';
    }

    if (nextMatch) {
      // Add text before match
      if (nextMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.substring(0, nextMatch.index)}</span>);
      }

      if (type === 'bold') {
        parts.push(<strong key={key++} className="font-bold">{nextMatch[1]}</strong>);
      } else {
        parts.push(<em key={key++} className="italic">{nextMatch[1]}</em>);
      }

      remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts;
};

const ChatBubble = ({ role, text, isError = false }) => {
  const isUser = role === 'user';
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`size-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-md
        ${isUser
          ? 'bg-primary'
          : isError
            ? 'bg-gradient-to-br from-red-400 to-red-600'
            : 'bg-gradient-to-br from-violet-500 to-purple-600'
        }`}>
        {isUser
          ? <span className="material-symbols-outlined text-[18px]">person</span>
          : isError
            ? <span className="material-symbols-outlined text-[18px]">warning</span>
            : <span className="material-symbols-outlined text-[18px]">psychology</span>
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-br-sm shadow-md shadow-primary/20'
          : isError
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm'
            : 'bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'
        }`}>
        {isUser ? text : formatText(text)}
      </div>
    </div>
  );
};

export default ChatBubble;
