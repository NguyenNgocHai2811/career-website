import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import WizardPhase from './phases/WizardPhase';
import IdentityPhase from './phases/IdentityPhase';
import GalaxyPhase from './phases/GalaxyPhase';
import DetailPhase from './phases/DetailPhase';
import {
  fetchTasks,
  fetchSkills,
  fetchIdentity,
  fetchCareerPaths,
  fetchCareerDetail,
  AuthError,
} from '../../services/careerExplorerService';

/**
 * CareerExplorer — V2 of /career-ai.
 * Phase machine: wizard (step 0..3) → identity → galaxy → detail
 */
const CareerExplorer = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  // ── State machine ───────────────────────────────────────
  const [phase, setPhase] = useState('wizard');
  const [wizardStep, setWizardStep] = useState(0);

  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');

  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [extraExperiences, setExtraExperiences] = useState([]);
  const [extraEducation, setExtraEducation] = useState([]);

  const [identityStatement, setIdentityStatement] = useState('');
  const [careerPaths, setCareerPaths] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerDetail, setCareerDetail] = useState(null);
  const [detailSection, setDetailSection] = useState(0);

  const [loading, setLoading] = useState(false);
  const [identityLoading, setIdentityLoading] = useState(false);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Helpers ─────────────────────────────────────────────
  const handleAuthError = useCallback(
    (err) => {
      if (err instanceof AuthError || err?.isAuthError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return true;
      }
      return false;
    },
    [navigate]
  );

  const showError = (err) => {
    if (handleAuthError(err)) return;
    setError(err?.message || 'Đã xảy ra lỗi.');
  };

  const clearError = () => setError('');

  // ── Step 0 → 1 ─────────────────────────────────────────
  const handleRoleNext = () => {
    if (role.trim()) {
      clearError();
      setWizardStep(1);
    }
  };

  // ── Step 1 → 2 (load tasks) ────────────────────────────
  const loadTasks = useCallback(async () => {
    clearError();
    setWizardStep(2);
    setLoading(true);
    try {
      const { tasks: generated } = await fetchTasks(token, {
        role: role.trim(),
        organization: organization.trim(),
      });
      setTasks(generated || []);
      setSelectedTasks(generated || []); // default check-all
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, organization]);

  const handleOrgNext = () => {
    loadTasks();
  };

  // ── Step 2 → 3 (load skills) ───────────────────────────
  const loadSkills = useCallback(async () => {
    clearError();
    setWizardStep(3);
    setLoading(true);
    try {
      const { skills: generated } = await fetchSkills(token, {
        role: role.trim(),
        tasks: selectedTasks,
      });
      setSkills(generated || []);
      setSelectedSkills([]);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, selectedTasks]);

  const handleTasksNext = () => {
    if (selectedTasks.length === 0) {
      // allow with empty? force user to pick at least 1.
      setError('Vui lòng chọn ít nhất 1 nhiệm vụ trước khi tiếp tục.');
      return;
    }
    loadSkills();
  };

  // ── Step 3 → Identity (load statement) ─────────────────
  const loadIdentity = useCallback(async () => {
    clearError();
    setPhase('identity');
    setIdentityLoading(true);
    try {
      const { statement } = await fetchIdentity(token, {
        role: role.trim(),
        organization: organization.trim(),
        tasks: selectedTasks,
        skills: selectedSkills,
        extraExperiences,
        extraEducation,
      });
      setIdentityStatement(statement || '');
    } catch (err) {
      showError(err);
    } finally {
      setIdentityLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, organization, selectedTasks, selectedSkills, extraExperiences, extraEducation]);

  const handleSkillsNext = () => {
    if (selectedSkills.length < 3) return;
    loadIdentity();
  };

  // ── Identity: regenerate / explore ─────────────────────
  const handleRegenerateIdentity = () => {
    loadIdentity();
  };

  const handleExplorePaths = useCallback(async () => {
    clearError();
    setPhase('galaxy');
    setPathsLoading(true);
    try {
      const { paths } = await fetchCareerPaths(token, {
        identityStatement,
        skills: selectedSkills,
      });
      setCareerPaths(paths || []);
    } catch (err) {
      showError(err);
    } finally {
      setPathsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, identityStatement, selectedSkills]);

  // ── Galaxy → Detail ───────────────────────────────────
  const handleCareerClick = useCallback(
    async (career) => {
      clearError();
      setSelectedCareer(career);
      setPhase('detail');
      setDetailSection(0);
      setCareerDetail(null);
      setDetailLoading(true);
      try {
        const detail = await fetchCareerDetail(token, {
          careerId: career.id,
          careerTitle: career.title,
        });
        setCareerDetail(detail);
      } catch (err) {
        showError(err);
      } finally {
        setDetailLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token]
  );

  // ── Extra profile data handlers ────────────────────────
  const handleAddExperience = (exp) => setExtraExperiences((prev) => [...prev, exp]);
  const handleRemoveExperience = (i) => setExtraExperiences((prev) => prev.filter((_, idx) => idx !== i));
  const handleAddEducation = (edu) => setExtraEducation((prev) => [...prev, edu]);
  const handleRemoveEducation = (i) => setExtraEducation((prev) => prev.filter((_, idx) => idx !== i));

  const handleWizardBack = () => {
    setWizardStep((s) => Math.max(0, s - 1));
    clearError();
  };

  // ── Regenerate from wizard step 2/3 ───────────────────
  const handleRegenerateTasks = () => {
    loadTasks();
  };
  const handleRegenerateSkills = () => {
    loadSkills();
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background-light">
      <AppHeader activeTab="career-ai" />

      {/* Error banner (sticky at top) */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <span className="text-sm text-red-700">⚠ {error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Đóng
          </button>
        </div>
      )}

      {phase === 'wizard' && (
        <WizardPhase
          step={wizardStep}
          role={role}
          setRole={setRole}
          organization={organization}
          setOrganization={setOrganization}
          tasks={tasks}
          selectedTasks={selectedTasks}
          setSelectedTasks={setSelectedTasks}
          skills={skills}
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          loading={loading}
          onRoleNext={handleRoleNext}
          onOrgNext={handleOrgNext}
          onTasksNext={handleTasksNext}
          onSkillsNext={handleSkillsNext}
          onBack={handleWizardBack}
          onRegenerateTasks={handleRegenerateTasks}
          onRegenerateSkills={handleRegenerateSkills}
        />
      )}

      {phase === 'identity' && (
        <IdentityPhase
          role={role}
          organization={organization}
          selectedSkills={selectedSkills}
          identityStatement={identityStatement}
          loading={identityLoading}
          extraExperiences={extraExperiences}
          extraEducation={extraEducation}
          onAddExperience={handleAddExperience}
          onRemoveExperience={handleRemoveExperience}
          onAddEducation={handleAddEducation}
          onRemoveEducation={handleRemoveEducation}
          onExplorePaths={handleExplorePaths}
          onRegenerate={handleRegenerateIdentity}
        />
      )}

      {phase === 'galaxy' && (
        <GalaxyPhase
          careerPaths={careerPaths}
          loading={pathsLoading}
          onCareerClick={handleCareerClick}
          onBack={() => setPhase('identity')}
        />
      )}

      {phase === 'detail' && selectedCareer && (
        <DetailPhase
          career={selectedCareer}
          detail={careerDetail}
          loading={detailLoading}
          section={detailSection}
          setSection={setDetailSection}
          onBack={() => setPhase('galaxy')}
        />
      )}
    </div>
  );
};

export default CareerExplorer;
