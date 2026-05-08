const aiService = require('../services/aiService');
const userRepository = require('../repositories/userRepository');

/**
 * Build a compact, readable profile context string to inject into the LLM prompt.
 */
const buildProfileContext = (profile) => {
  if (!profile) return 'Người dùng chưa có thông tin hồ sơ.';

  const lines = [];

  if (profile.fullName) lines.push(`Họ tên: ${profile.fullName}`);
  if (profile.headline) lines.push(`Tiêu đề nghề nghiệp: ${profile.headline}`);
  if (profile.about) lines.push(`Giới thiệu bản thân: ${profile.about}`);

  if (profile.education?.length) {
    const edu = profile.education.map(e =>
      `${e.degree || ''} ${e.field || ''} tại ${e.schoolName || ''}`.trim()
    ).join('; ');
    lines.push(`Học vấn: ${edu}`);
  }

  if (profile.experiences?.length) {
    const exp = profile.experiences.map(e =>
      `${e.title || ''} tại ${e.company || ''}`.trim()
    ).join('; ');
    lines.push(`Kinh nghiệm: ${exp}`);
  }

  if (profile.skills?.length) {
    lines.push(`Kỹ năng: ${profile.skills.join(', ')}`);
  }

  if (profile.certifications?.length) {
    const certs = profile.certifications.map(c => c.name).join(', ');
    lines.push(`Chứng chỉ: ${certs}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'Hồ sơ còn trống, chưa có thông tin cụ thể.';
};

/**
 * Map low-level AI errors to user-friendly 503 responses.
 * Returns true if response was sent (caller should return), false otherwise.
 */
const handleAiError = (err, res) => {
  const msg = err?.message || '';
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    res.status(503).json({
      success: false,
      error: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút.',
    });
    return true;
  }
  return false;
};

/**
 * POST /v1/ai/career-tasks
 * Body: { role: string, organization?: string }
 */
const generateTasks = async (req, res, next) => {
  try {
    const { role, organization = '' } = req.body || {};

    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Vai trò không được để trống.' });
    }
    if (role.length > 100) {
      return res.status(400).json({ success: false, error: 'Vai trò không được vượt quá 100 ký tự.' });
    }
    if (typeof organization !== 'string' || organization.length > 100) {
      return res.status(400).json({ success: false, error: 'Tổ chức không được vượt quá 100 ký tự.' });
    }

    const data = await aiService.generateTasks({
      role: role.trim(),
      organization: organization.trim(),
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    if (handleAiError(err, res)) return;
    next(err);
  }
};

/**
 * POST /v1/ai/career-skills
 * Body: { role: string, tasks: string[] }
 */
const generateSkills = async (req, res, next) => {
  try {
    const { role, tasks } = req.body || {};

    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Vai trò không được để trống.' });
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, error: 'Cần ít nhất 1 nhiệm vụ.' });
    }
    if (tasks.length > 20) {
      return res.status(400).json({ success: false, error: 'Tối đa 20 nhiệm vụ.' });
    }
    if (tasks.some(t => typeof t !== 'string' || t.length > 200)) {
      return res.status(400).json({ success: false, error: 'Mỗi nhiệm vụ phải là chuỗi ≤ 200 ký tự.' });
    }

    const data = await aiService.generateSkills({
      role: role.trim(),
      tasks: tasks.map(t => t.trim()),
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    if (handleAiError(err, res)) return;
    next(err);
  }
};

/**
 * POST /v1/ai/career-identity
 * Body: { role, organization?, tasks: string[], skills: string[] }
 */
const generateIdentity = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { role, organization = '', tasks = [], skills } = req.body || {};

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ success: false, error: 'Vai trò không được để trống.' });
    }
    if (!Array.isArray(skills) || skills.length < 3) {
      return res.status(400).json({ success: false, error: 'Cần chọn tối thiểu 3 kỹ năng.' });
    }
    if (skills.length > 30) {
      return res.status(400).json({ success: false, error: 'Tối đa 30 kỹ năng.' });
    }
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, error: 'tasks phải là một mảng.' });
    }

    const profile = await userRepository.getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    const data = await aiService.generateIdentityStatement({
      role: role.trim(),
      organization: organization.trim(),
      tasks: tasks.map(t => String(t).trim()).filter(Boolean),
      skills: skills.map(s => String(s).trim()).filter(Boolean),
      profileContext,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    if (handleAiError(err, res)) return;
    next(err);
  }
};

/**
 * POST /v1/ai/career-paths
 * Body: { identityStatement: string, skills: string[] }
 */
const generateCareerPaths = async (req, res, next) => {
  try {
    const { identityStatement, skills } = req.body || {};

    if (!identityStatement || typeof identityStatement !== 'string' || identityStatement.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Career Identity Statement quá ngắn (cần ≥ 50 ký tự).' });
    }
    if (identityStatement.length > 3000) {
      return res.status(400).json({ success: false, error: 'Career Identity Statement quá dài (≤ 3000 ký tự).' });
    }
    if (!Array.isArray(skills) || skills.length < 3) {
      return res.status(400).json({ success: false, error: 'Cần ít nhất 3 kỹ năng.' });
    }

    const data = await aiService.generateCareerPaths({
      identityStatement: identityStatement.trim(),
      skills: skills.map(s => String(s).trim()).filter(Boolean),
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    if (handleAiError(err, res)) return;
    next(err);
  }
};

/**
 * POST /v1/ai/career-detail
 * Body: { careerId: string, careerTitle: string }
 */
const generateCareerDetail = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { careerId, careerTitle } = req.body || {};

    if (!careerId || typeof careerId !== 'string') {
      return res.status(400).json({ success: false, error: 'careerId không được để trống.' });
    }
    if (!careerTitle || typeof careerTitle !== 'string') {
      return res.status(400).json({ success: false, error: 'careerTitle không được để trống.' });
    }
    if (careerId.length > 100 || careerTitle.length > 200) {
      return res.status(400).json({ success: false, error: 'careerId/careerTitle quá dài.' });
    }

    const profile = await userRepository.getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    const data = await aiService.generateCareerDetail({
      careerId: careerId.trim(),
      careerTitle: careerTitle.trim(),
      profileContext,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    if (handleAiError(err, res)) return;
    next(err);
  }
};

module.exports = {
  generateTasks,
  generateSkills,
  generateIdentity,
  generateCareerPaths,
  generateCareerDetail,
};
