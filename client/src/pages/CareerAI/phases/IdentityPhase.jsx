import React, { useState } from 'react';
import Chip from '../components/Chip';
import ProfileSection from '../components/ProfileSection';
import AiLoading from '../components/AiLoading';

const IdentityPhase = ({
  role,
  organization,
  selectedSkills,
  identityStatement,
  loading,
  extraExperiences,
  extraEducation,
  onAddExperience,
  onRemoveExperience,
  onAddEducation,
  onRemoveEducation,
  onExplorePaths,
  onRegenerate,
}) => {
  const [showExpInput, setShowExpInput] = useState(false);
  const [showEduInput, setShowEduInput] = useState(false);
  const [inputExp, setInputExp] = useState('');
  const [inputEdu, setInputEdu] = useState('');

  const handleAddExp = () => {
    if (inputExp.trim()) {
      onAddExperience(inputExp.trim());
      setInputExp('');
      setShowExpInput(false);
    }
  };

  const handleAddEdu = () => {
    if (inputEdu.trim()) {
      onAddEducation(inputEdu.trim());
      setInputEdu('');
      setShowEduInput(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-72px)] px-6 md:px-10 py-8 gap-8 max-w-[1200px] mx-auto w-full">
      {/* Left – Profile */}
      <div className="flex-1 min-w-0">
        <ProfileSection icon="🌱" title="Experience">
          <Chip blue>
            {role}{organization ? ` • ${organization}` : ''}
          </Chip>
          {extraExperiences.map((exp, i) => (
            <Chip key={i} blue removable onClick={() => onRemoveExperience(i)}>
              {exp}
            </Chip>
          ))}
          {showExpInput ? (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <input
                autoFocus
                value={inputExp}
                maxLength={80}
                onChange={(e) => setInputExp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExp()}
                placeholder="Position • Company..."
                className="text-sm border border-gray-300 rounded-full px-3 py-1.5 outline-none focus:border-primary w-52"
              />
              <button
                type="button"
                onClick={handleAddExp}
                className="text-xs bg-primary text-white rounded-full px-3 py-1.5 font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowExpInput(false); setInputExp(''); }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Chip outline onClick={() => setShowExpInput(true)}>
              + Add experience
            </Chip>
          )}
        </ProfileSection>

        <ProfileSection icon="🎓" title="Education">
          {extraEducation.map((edu, i) => (
            <Chip key={i} blue removable onClick={() => onRemoveEducation(i)}>
              {edu}
            </Chip>
          ))}
          {showEduInput ? (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <input
                autoFocus
                value={inputEdu}
                maxLength={80}
                onChange={(e) => setInputEdu(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEdu()}
                placeholder="Degree • School..."
                className="text-sm border border-gray-300 rounded-full px-3 py-1.5 outline-none focus:border-primary w-52"
              />
              <button
                type="button"
                onClick={handleAddEdu}
                className="text-xs bg-primary text-white rounded-full px-3 py-1.5 font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => { setShowEduInput(false); setInputEdu(''); }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <Chip outline onClick={() => setShowEduInput(true)}>
              + Add education
            </Chip>
          )}
        </ProfileSection>

        <ProfileSection icon="💪" title="Skills">
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
