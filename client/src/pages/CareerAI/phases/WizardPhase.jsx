import React from 'react';
import Btn from '../components/Btn';
import Chip from '../components/Chip';
import AiLoading from '../components/AiLoading';

/**
 * WizardPhase — 4 step linear flow:
 *   step 0: nhập role
 *   step 1: nhập organization (optional)
 *   step 2: chọn các nhiệm vụ AI gợi ý (multi-select)
 *   step 3: chọn ≥ 3 kỹ năng (multi-select)
 */
const WizardPhase = ({
  step,
  role,
  setRole,
  organization,
  setOrganization,
  tasks,
  selectedTasks,
  setSelectedTasks,
  skills,
  selectedSkills,
  setSelectedSkills,
  loading,
  onRoleNext,
  onOrgNext,
  onTasksNext,
  onSkillsNext,
  onBack,
  onRegenerateTasks,
  onRegenerateSkills,
}) => {
  const wrapClass =
    'flex flex-col items-start justify-center min-h-[calc(100vh-72px)] px-6 md:px-20 py-10 max-w-3xl mx-auto w-full';

  // ── Step 0: Vai trò ──────────────────────────────────────
  if (step === 0) {
    return (
      <div className={wrapClass}>
        <div className="text-sm text-slate-500 mb-4">
          👋 Để bắt đầu, hãy chia sẻ vị trí hiện tại hoặc trước đây của bạn:
        </div>
        <input
          autoFocus
          value={role}
          maxLength={50}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && role.trim() && onRoleNext()}
          placeholder="Lập trình viên, Kế toán, Marketing..."
          className="w-full text-3xl md:text-[32px] font-bold text-slate-800 bg-transparent border-none outline-none mb-1 placeholder:text-slate-300"
        />
        <div className="text-xs text-slate-400 mb-6">{role.length}/50 ký tự</div>
        <div className="flex gap-3">
          <Btn primary disabled={!role.trim()} onClick={onRoleNext}>
            Tiếp theo
          </Btn>
        </div>
      </div>
    );
  }

  // ── Step 1: Tổ chức (optional) ──────────────────────────
  if (step === 1) {
    return (
      <div className={wrapClass}>
        <div className="text-3xl md:text-[32px] font-bold text-slate-800 mb-2">{role}</div>
        <input
          autoFocus
          value={organization}
          maxLength={100}
          onChange={(e) => setOrganization(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onOrgNext()}
          placeholder="Tổ chức hoặc ngành (tuỳ chọn)"
          className="w-full text-2xl md:text-[28px] font-normal text-slate-500 bg-transparent border-none outline-none mb-6 placeholder:text-slate-300"
        />
        <div className="flex gap-3">
          <Btn onClick={onBack}>Quay lại</Btn>
          <Btn primary onClick={onOrgNext}>
            Tiếp theo
          </Btn>
        </div>
      </div>
    );
  }

  // ── Step 2: Chọn nhiệm vụ ───────────────────────────────
  if (step === 2) {
    return (
      <div className={wrapClass}>
        <div className="text-3xl md:text-[32px] font-bold text-slate-800 mb-1">{role}</div>
        {loading ? (
          <AiLoading text="Đang tạo danh sách nhiệm vụ..." />
        ) : (
          <>
            <div className="text-[15px] text-slate-500 mb-4">
              Chọn các nhiệm vụ bạn đã thực hiện với tư cách là <b>{role}</b> (tuỳ chọn).
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {onRegenerateTasks && (
                <button
                  type="button"
                  onClick={onRegenerateTasks}
                  className="text-xs text-slate-500 hover:text-primary border border-gray-200 rounded-full px-3 py-1 transition-colors"
                >
                  ✦ Tạo lại
                </button>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
                <input
                  type="checkbox"
                  readOnly
                  checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                  onClick={() =>
                    setSelectedTasks(
                      selectedTasks.length === tasks.length ? [] : tasks
                    )
                  }
                  className="cursor-pointer"
                />
                <span>Chọn tất cả</span>
              </label>
            </div>
            <div className="flex flex-col gap-2.5 w-full mb-6">
              {tasks.map((t, i) => {
                const checked = selectedTasks.includes(t);
                return (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedTasks((p) =>
                        p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
                      )
                    }
                    className={`px-5 py-3.5 rounded-xl cursor-pointer text-[15px] transition-all border-[1.5px] ${
                      checked
                        ? 'bg-green-50 border-green-500 text-slate-800'
                        : 'bg-gray-100 border-transparent text-slate-700 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Btn onClick={onBack}>Quay lại</Btn>
              <Btn primary onClick={onTasksNext}>
                Tiếp theo
              </Btn>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Step 3: Chọn kỹ năng (≥ 3) ──────────────────────────
  if (step === 3) {
    return (
      <div className={wrapClass}>
        <div className="text-3xl md:text-[32px] font-bold text-slate-800 mb-1">{role}</div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Chip green>{selectedTasks.length} nhiệm vụ</Chip>
        </div>
        {loading ? (
          <AiLoading text="Đang tạo danh sách kỹ năng..." />
        ) : (
          <>
            <div className="text-[15px] text-slate-500 mb-4">
              Chọn ít nhất <b>3 kỹ năng</b> phù hợp với bạn.
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {onRegenerateSkills && (
                <button
                  type="button"
                  onClick={onRegenerateSkills}
                  className="text-xs text-slate-500 hover:text-primary border border-gray-200 rounded-full px-3 py-1 transition-colors"
                >
                  ✦ Tạo lại
                </button>
              )}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-500">
                <input
                  type="checkbox"
                  readOnly
                  checked={skills.length > 0 && selectedSkills.length === skills.length}
                  onClick={() =>
                    setSelectedSkills(
                      selectedSkills.length === skills.length ? [] : skills
                    )
                  }
                  className="cursor-pointer"
                />
                <span>Chọn tất cả</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {skills.map((s, i) => {
                const checked = selectedSkills.includes(s);
                return (
                  <div
                    key={i}
                    onClick={() =>
                      setSelectedSkills((p) =>
                        p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
                      )
                    }
                    className={`px-4 py-2.5 rounded-full cursor-pointer text-sm font-medium transition-all border-[1.5px] ${
                      checked
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-100 border-transparent text-slate-700 hover:bg-gray-200'
                    }`}
                  >
                    {s}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <Btn onClick={onBack}>Quay lại</Btn>
              <Btn primary disabled={selectedSkills.length < 3} onClick={onSkillsNext}>
                Tiếp theo
              </Btn>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default WizardPhase;
