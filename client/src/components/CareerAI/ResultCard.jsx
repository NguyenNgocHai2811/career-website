import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResultCard = ({ suggestion, onExport, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const medalColors = [
    'from-amber-400 to-yellow-500',
    'from-slate-300 to-gray-400',
    'from-orange-400 to-amber-600',
  ];
  const medalIcons = ['emoji_events', 'workspace_premium', 'military_tech'];

  return (
    <div
      className="relative bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 group"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`size-11 rounded-xl bg-gradient-to-br ${medalColors[index] || medalColors[2]} flex items-center justify-center text-white shrink-0 shadow-md`}>
            <span className="material-symbols-outlined text-[22px]">{medalIcons[index] || 'work'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">
                {suggestion.career}
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                #{index + 1}
              </span>
            </div>
            {suggestion.salaryRange && (
              <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">payments</span>
                {suggestion.salaryRange}
              </span>
            )}
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={() => onExport(suggestion.career)}
          title="Sao chép ngữ cảnh & hỏi AI khác"
          className="p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-slate-400 hover:text-violet-600 transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
        </button>
      </div>

      {/* Description */}
      {suggestion.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          {suggestion.description}
        </p>
      )}

      {/* Reasoning */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 mb-4">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          Tại sao phù hợp với bạn
        </p>
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{suggestion.reasoning}</p>
      </div>

      {/* Skills chips */}
      {suggestion.skills?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">build</span>
            Kỹ năng cần thiết
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestion.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs rounded-full font-medium border border-violet-100 dark:border-violet-800">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(suggestion.searchKeyword || suggestion.career)}`)}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold hover:from-violet-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98]"
      >
        <span className="material-symbols-outlined text-[18px]">search</span>
        Tìm việc liên quan trên KORRA
      </button>
    </div>
  );
};

export default ResultCard;
