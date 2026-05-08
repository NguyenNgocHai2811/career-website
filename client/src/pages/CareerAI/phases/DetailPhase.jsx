import React from 'react';
import { useNavigate } from 'react-router-dom';
import AiLoading from '../components/AiLoading';
import InfoPill from '../components/InfoPill';

/**
 * DetailPhase — snap-scroll detail (4 sections):
 *   0 = Tổng quan, 1 = Điểm mạnh, 2 = Ngày làm việc, 3 = Học thêm
 */
const SECTION_TITLES = ['Tổng quan', 'Điểm mạnh', 'Ngày làm việc', 'Học thêm'];

const DetailPhase = ({ career, detail, loading, section, setSection, onBack }) => {
  const navigate = useNavigate();

  const handleFindJobs = () => {
    const keyword = career.searchKeyword || career.title;
    navigate(`/jobs?title=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] overflow-hidden">
      {/* Top-left back */}
      <div className="fixed top-20 left-5 z-[100]">
        <button
          type="button"
          onClick={onBack}
          className="bg-white border border-gray-200 rounded-full px-4 py-2 text-[13px] flex items-center gap-1.5 shadow-sm hover:bg-gray-50 transition-colors"
        >
          ← Quay lại
        </button>
      </div>

      {/* Top-right find jobs */}
      <div className="fixed top-20 right-5 z-[100]">
        <button
          type="button"
          onClick={handleFindJobs}
          className="bg-primary text-white rounded-full px-5 py-2.5 text-[13px] font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
        >
          Tìm việc phù hợp ↗
        </button>
      </div>

      {/* Section dots (left center) */}
      <div className="fixed left-5 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2.5">
        {SECTION_TITLES.map((s, i) => (
          <button
            key={i}
            type="button"
            title={s}
            onClick={() => setSection(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === section ? 'bg-primary scale-125' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center pt-20 pb-5 px-6">
        <div className="text-[13px] text-slate-500 mb-2">Hãy tưởng tượng bạn là:</div>
        <h1
          className="text-4xl md:text-[52px] font-extrabold m-0 leading-tight text-gradient"
          style={{
            background: 'linear-gradient(135deg, #6C7EE1, #34a853)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {career.title}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <AiLoading text="Đang tải chi tiết nghề..." />
        </div>
      ) : detail ? (
        <div className="max-w-[800px] mx-auto px-6 md:px-16 pb-16">
          {/* Section 0 — Tổng quan */}
          {section === 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
              <p className="text-[17px] leading-relaxed text-slate-800 mb-6 whitespace-pre-line">
                {detail.description}
              </p>
              <div className="flex flex-wrap gap-3">
                {career.salary && <InfoPill icon="💰" label="Mức lương TB" value={career.salary} />}
                {career.degree && <InfoPill icon="🎓" label="Bằng cấp" value={career.degree} />}
              </div>
              <div className="text-[11px] text-slate-400 mt-4">
                Nguồn: AI tổng hợp từ profile và dữ liệu thị trường.
              </div>
            </div>
          )}

          {/* Section 1 — Điểm mạnh */}
          {section === 1 && (
            <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
              <h2 className="text-[22px] font-bold mb-2">💪 Điểm tương đồng</h2>
              <p className="text-[14px] text-slate-500 mb-5">
                Hãy xem vai trò{' '}
                <span className="text-primary font-semibold">{career.title}</span>{' '}
                có thể phù hợp với bạn như thế nào.
              </p>
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="flex-1 w-full">
                  <div className="px-4 py-3 bg-green-50 rounded-xl border-[1.5px] border-green-500 text-[14px] font-medium mb-2">
                    Hồ sơ KORRA
                  </div>
                  <div className="px-4 py-3 bg-gray-100 rounded-xl text-[14px] text-slate-500">
                    Kỹ năng tự đánh giá
                  </div>
                </div>
                <div className="flex-[2] w-full p-4 bg-gray-100 rounded-xl text-[14px] leading-relaxed text-slate-800 border border-gray-200 whitespace-pre-line">
                  {detail.sweetSpots}
                </div>
              </div>
            </div>
          )}

          {/* Section 2 — Ngày làm việc */}
          {section === 2 && (
            <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
              <h2 className="text-[22px] font-bold mb-2">📋 Một ngày làm việc</h2>
              <p className="text-[14px] text-slate-500 mb-5">
                Một ngày với vai trò{' '}
                <span className="text-primary font-semibold">{career.title}</span>{' '}
                trông như thế này.
              </p>
              <div className="flex flex-col gap-2.5">
                {(detail.dayInLife || []).map((item, i) => (
                  <div
                    key={i}
                    className={`px-5 py-3.5 rounded-xl text-[14px] border-[1.5px] ${
                      i === 0
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-100 border-transparent'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3 — Học thêm */}
          {section === 3 && (
            <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
              <h2 className="text-[22px] font-bold mb-2">🚀 Tài nguyên học tập</h2>
              <p className="text-[14px] text-slate-500 mb-5">
                Những tài nguyên có thể giúp bạn phát triển kỹ năng cho vai trò{' '}
                <span className="text-primary font-semibold">{career.title}</span>.
              </p>
              <div className="flex flex-col gap-4">
                {(detail.courses || []).map((c, i) => (
                  <div
                    key={i}
                    className="px-6 py-5 bg-gray-100 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="text-3xl">{c.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-slate-800 truncate">
                        {c.title}
                      </div>
                      <div className="text-[13px] text-slate-500 truncate">{c.platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setSection((s) => Math.max(0, s - 1))}
              disabled={section === 0}
              className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              ← Trước
            </button>
            <button
              type="button"
              onClick={() => setSection((s) => Math.min(SECTION_TITLES.length - 1, s + 1))}
              disabled={section === SECTION_TITLES.length - 1}
              className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-default transition-colors"
            >
              Tiếp →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DetailPhase;
