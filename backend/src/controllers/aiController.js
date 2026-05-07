const aiService = require('../services/aiService');
const userRepository = require('../repositories/userRepository');

/**
 * Build a compact, readable profile context string to inject into the LLM prompt.
 * Pulls from existing getUserProfile() — no new DB queries needed.
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
 * POST /v1/ai/career-predict
 * Body: { message: string, conversationHistory: [{role, text}] }
 * Returns: { type, message, options, suggestions }
 */
const careerPredict = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ success: false, error: 'Tin nhắn không được vượt quá 500 ký tự.' });
    }

    // Limit conversation history length to prevent abuse
    const trimmedHistory = conversationHistory.slice(-20);

    // 1. Load user profile for personalized context
    const profile = await userRepository.getUserProfile(userId);
    const profileContext = buildProfileContext(profile);

    // 2. Append new user message to history
    const updatedHistory = [
      ...trimmedHistory,
      { role: 'user', text: message }
    ];

    // 3. Call AI service (Gemini → Ollama fallback)
    const aiResponse = await aiService.chat(profileContext, updatedHistory);

    // 4. Return structured response to frontend
    res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (err) {
    // Handle specific AI-related errors gracefully
    const errorMessage = err.message || '';

    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
      return res.status(503).json({
        success: false,
        error: 'Hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút.'
      });
    }

    if (errorMessage.includes('Both AI providers failed')) {
      return res.status(503).json({
        success: false,
        error: 'Tất cả hệ thống AI hiện không khả dụng. Vui lòng thử lại sau.'
      });
    }

    next(err);
  }
};

/**
 * POST /v1/ai/export-context
 * Body: { selectedOptions: string[], suggestions: object[], targetCareer: string }
 * Returns: { contextText: string }
 */
const exportContext = async (req, res, next) => {
  try {
    const { selectedOptions = [], suggestions = [], targetCareer = '' } = req.body;

    const contextText = aiService.buildExportContext(selectedOptions, suggestions, targetCareer);

    res.status(200).json({ success: true, data: { contextText } });
  } catch (err) {
    next(err);
  }
};

module.exports = { careerPredict, exportContext };
