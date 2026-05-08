import React, { useState } from 'react';
import AiLoading from '../components/AiLoading';

/**
 * GalaxyPhase — Constellation map of career suggestions.
 * Each node positioned via percentage (x, y in [0,1]).
 */
const GalaxyPhase = ({ careerPaths, loading, onCareerClick, onBack }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [previewCareer, setPreviewCareer] = useState(null);

  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-background-light overflow-hidden">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors bg-white/60 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-gray-200/50"
      >
        ← Quay lại
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <AiLoading text="Đang khám phá lộ trình nghề nghiệp phù hợp..." />
        </div>
      ) : (
        <>
          {/* Background glow rings */}
          <svg
            width="100%"
            height="600"
            className="absolute top-16 left-0 pointer-events-none"
            aria-hidden
          >
            <circle cx="50%" cy="50%" r="120" fill="none" stroke="#34a853" strokeWidth="0.5" opacity="0.10" />
            <circle cx="50%" cy="50%" r="220" fill="none" stroke="#34a853" strokeWidth="0.5" opacity="0.13" />
            <circle cx="50%" cy="50%" r="340" fill="none" stroke="#34a853" strokeWidth="0.5" opacity="0.16" />
          </svg>

          {/* Nodes container */}
          <div className="relative w-full" style={{ height: 660, padding: '60px 0 0 0' }}>
            {/* Center orb */}
            <div
              className="absolute z-10 flex flex-col items-center justify-center rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 130,
                height: 130,
                background:
                  'radial-gradient(circle, #e8f5e9 0%, #c8e6c9 60%, transparent 100%)',
                boxShadow: '0 0 40px rgba(52,168,83,0.3)',
              }}
            >
              <div className="text-2xl">🌱💪</div>
              <div className="text-[11px] text-slate-500 text-center mt-1 leading-tight">
                Khám phá<br />nghề nghiệp
              </div>
            </div>

            {/* Career nodes */}
            {careerPaths.map((career) => {
              const isHover = hoveredId === career.id;
              const isAi = career.type === 'ai';
              return (
                <div
                  key={career.id}
                  className="absolute z-20 cursor-pointer"
                  style={{
                    left: `${career.x * 100}%`,
                    top: `${career.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => {
                    setHoveredId(career.id);
                    setPreviewCareer(career);
                  }}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onCareerClick(career)}
                >
                  <div
                    className={`flex items-center gap-1.5 rounded-full transition-all border-[1.5px] ${
                      isAi ? 'border-green-500' : 'border-primary'
                    } ${
                      isHover
                        ? 'bg-white shadow-lg scale-105'
                        : 'bg-white/70 backdrop-blur-sm shadow-sm'
                    }`}
                    style={{ padding: '7px 14px' }}
                  >
                    <span
                      className={`block w-2.5 h-2.5 rounded-full ${
                        isAi ? 'bg-green-500' : 'bg-primary'
                      }`}
                    />
                    <span className="text-[13px] font-medium text-slate-800 whitespace-nowrap">
                      {career.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="absolute bottom-5 left-6 flex gap-4 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-xs text-slate-500">Từ database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-slate-500">Gợi ý AI</span>
            </div>
          </div>

          {/* Preview panel */}
          {previewCareer && (
            <div className="absolute right-6 top-20 w-[300px] bg-white rounded-2xl p-6 shadow-float z-50 border border-gray-100">
              <h3 className="text-base font-bold text-slate-800 mb-2">
                {previewCareer.title}
              </h3>
              <div className="text-[13px] text-slate-500 mb-1">
                💰 {previewCareer.salary}
              </div>
              <div className="text-[13px] text-slate-500 mb-4">
                🎓 {previewCareer.degree}
              </div>
              <button
                type="button"
                onClick={() => onCareerClick(previewCareer)}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors active:scale-[0.98]"
              >
                Xem chi tiết →
              </button>
              <div className="text-[11px] text-slate-400 mt-3 text-center">
                Đây chỉ là gợi ý, không phải lời khuyên nghề nghiệp chính thức.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalaxyPhase;
