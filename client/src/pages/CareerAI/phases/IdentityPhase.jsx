import React from 'react';
import Chip from '../components/Chip';
import ProfileSection from '../components/ProfileSection';
import AiLoading from '../components/AiLoading';

/**
 * IdentityPhase — split-pane:
 *   left = profile sections (experience, education, skills)
 *   right = Career Identity Statement card
 */
const IdentityPhase = ({
  role,
  organization,
  selectedSkills,
  identityStatement,
  loading,
  onExplorePaths,
  onEditProfile,
  onRegenerate,
}) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)] px-6 md:px-10 py-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Left – Profile */}
      <div className="flex-1 min-w-0">
        <ProfileSection icon="🌱" title="Kinh nghiệm">
          <Chip blue removable>
            {role}
            {organization ? ` • ${organization}` : ''}
          </Chip>
          <Chip outline onClick={onEditProfile}>
            + Thêm kinh nghiệm
          </Chip>
        </ProfileSection>

        <ProfileSection icon="🎓" title="Học vấn">
          <Chip outline>+ Thêm học vấn</Chip>
        </ProfileSection>

        <ProfileSection icon="💪" title="Kỹ năng">
          {selectedSkills.map((s, i) => (
            <Chip key={i} green removable>
              {s}
            </Chip>
          ))}
        </ProfileSection>
      </div>

      {/* Right – Identity Statement */}
      <div className="flex-[1.4] bg-white rounded-3xl p-8 shadow-card flex flex-col min-h-[400px]">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-green-600 text-base">✦</span>
          <span className="text-[15px] font-semibold text-green-700">
            Hồ sơ nghề nghiệp
          </span>
          <span className="ml-auto text-xs text-white bg-slate-500 rounded-full px-2 py-0.5 font-semibold">
            BẢN NHÁP
          </span>
        </div>

        {loading ? (
          <AiLoading text="Đang tạo hồ sơ nghề nghiệp..." />
        ) : (
          <>
            <p className="text-lg leading-relaxed text-slate-800 flex-1 mb-6 whitespace-pre-line">
              {identityStatement}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onRegenerate}
                className="text-[13px] text-slate-500 hover:text-primary border border-gray-200 rounded-full px-3.5 py-1.5 transition-colors"
              >
                ✦ Tạo lại
              </button>
              <button
                type="button"
                onClick={onExplorePaths}
                className="ml-auto px-6 py-2.5 rounded-full bg-primary text-white text-[15px] font-semibold shadow-md shadow-primary/30 hover:bg-primary-dark transition-colors active:scale-[0.98]"
              >
                Khám phá nghề nghiệp →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IdentityPhase;
