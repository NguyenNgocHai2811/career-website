/**
 * AI Service — Abstraction layer for LLM providers.
 *
 * Priority: Google Gemini (primary) → Ollama local (fallback)
 *
 * Usage:
 *   const aiService = require('./aiService');
 *   const result = await aiService.chat(messages);
 */

const geminiProvider = require('./providers/geminiProvider');
const ollamaProvider = require('./providers/ollamaProvider');

// System prompt for Career Discovery Engine
const CAREER_COUNSELOR_SYSTEM_PROMPT = `Bạn là một chuyên gia tư vấn nghề nghiệp thân thiện và am hiểu thị trường lao động Việt Nam.
Bạn đang trò chuyện với người dùng trên nền tảng KORRA — một mạng xã hội nghề nghiệp.

Nhiệm vụ của bạn:
1. Giúp người dùng (học sinh, sinh viên, người chuyển ngành) khám phá nghề nghiệp phù hợp.
2. Sau mỗi lượt người dùng trả lời, hãy đặt CÂU HỎI TIẾP THEO để hiểu rõ hơn, kèm 3-5 "gợi mở" (options) dạng button/chip để họ chọn.
3. Hãy đặt tối thiểu 2, tối đa 4 câu hỏi (tức 2-4 vòng hội thoại) trước khi đưa ra kết quả.
4. Sau khi đã đủ thông tin (2-4 vòng), tổng hợp và đưa ra đúng 3 gợi ý nghề nghiệp CUỐI CÙNG.

Quy tắc trả về JSON NGHIÊM NGẶT (chỉ trả JSON, không thêm text nào khác):
{
  "type": "options" | "result",
  "message": "Câu hỏi hoặc nhận xét của bạn (dùng markdown nhẹ: **in đậm**, *in nghiêng*)",
  "options": ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3"],
  "suggestions": [
    {
      "career": "Tên nghề",
      "description": "Mô tả 2-3 câu về công việc hàng ngày",
      "reasoning": "Tại sao gợi ý nghề này cho người dùng CỤ THỂ này, dựa trên những gì họ đã chia sẻ",
      "skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3"],
      "salaryRange": "X - Y triệu/tháng",
      "searchKeyword": "từ khóa tìm kiếm việc làm trên KORRA"
    }
  ]
}

Khi type là "options": "suggestions" để null, "options" phải có 3-5 items.
Khi type là "result": "options" để mảng rỗng, PHẢI có đúng 3 items trong "suggestions".
Luôn trả lời bằng tiếng Việt, thân thiện và tích cực.
Bắt đầu cuộc hội thoại bằng cách chào hỏi và hỏi câu hỏi đầu tiên.`;

/**
 * Build the full conversation for the LLM including system prompt and user profile context.
 * @param {string} profileContext - Serialized user profile
 * @param {Array<{role: string, text: string}>} conversationHistory
 * @returns {Array<{role: string, text: string}>}
 */
const buildMessages = (profileContext, conversationHistory) => {
  const systemMessage = {
    role: 'user',
    text: CAREER_COUNSELOR_SYSTEM_PROMPT + '\n\n' +
      '--- THÔNG TIN HỒ SƠ NGƯỜI DÙNG (đã được xác minh) ---\n' +
      profileContext
  };
  // Gemini requires alternating user/model turns; first message must be user
  return [systemMessage, ...conversationHistory];
};

/**
 * Send a conversation to the LLM with auto-fallback.
 * @param {string} profileContext - User profile as context string
 * @param {Array<{role: 'user'|'model', text: string}>} conversationHistory
 * @returns {Promise<{type: string, message: string, options: string[], suggestions: object[]|null}>}
 */
const chat = async (profileContext, conversationHistory) => {
  const messages = buildMessages(profileContext, conversationHistory);

  let rawText = '';

  try {
    // Primary: Gemini
    if (!process.env.GEMINI_API_KEY) throw new Error('No Gemini API Key configured');
    console.log('[aiService] Using Gemini provider');
    rawText = await geminiProvider.chat(messages);
  } catch (geminiError) {
    console.warn(`[aiService] Gemini failed (${geminiError.message}), falling back to Ollama...`);
    try {
      rawText = await ollamaProvider.chat(messages);
      console.log('[aiService] Ollama fallback succeeded');
    } catch (ollamaError) {
      console.error(`Both AI providers failed. Gemini: ${geminiError.message} | Ollama: ${ollamaError.message}`);
      console.warn('[aiService] Using mock response due to AI provider failure.');
      rawText = JSON.stringify({
        type: 'options',
        message: 'Xin lỗi, hệ thống AI hiện đang quá tải. Tuy nhiên, tôi có thể gợi ý một số hướng đi mẫu để bạn tiếp tục khám phá:',
        options: ['Làm việc với con người', 'Làm việc với công nghệ', 'Sáng tạo và nghệ thuật'],
        suggestions: null
      });
    }
  }

  // Parse JSON response from LLM
  try {
    // Strip potential markdown code fences if LLM wraps the JSON
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate and normalize the response structure
    return {
      type: parsed.type || 'options',
      message: parsed.message || 'Tôi đang phân tích thông tin của bạn...',
      options: Array.isArray(parsed.options) ? parsed.options : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : null,
    };
  } catch {
    // If LLM returns non-JSON, wrap it gracefully
    console.warn('[aiService] LLM returned non-JSON, wrapping response');
    return {
      type: 'options',
      message: rawText,
      options: [],
      suggestions: null
    };
  }
};

/**
 * Build a human-readable context string for clipboard export.
 * @param {Array<string>} selectedOptions
 * @param {Array<{career: string}>} suggestions
 * @param {string} targetCareer - The career the user wants to explore deeper
 * @returns {string}
 */
const buildExportContext = (selectedOptions, suggestions, targetCareer) => {
  const optionsList = selectedOptions.join(' → ');
  const suggestionsList = suggestions.map(s => s.career).join(', ');
  return `Tôi vừa hoàn thành khám phá nghề nghiệp trên KORRA Career AI.

Các lựa chọn tôi đã trả lời: ${optionsList}
Gợi ý nghề nghiệp nhận được: ${suggestionsList}

Tôi muốn tìm hiểu sâu hơn về ngành "${targetCareer}". Cụ thể:
- Lộ trình học tập từ đầu cần những bước nào?
- Những kỹ năng nào quan trọng nhất và cần bao lâu để thành thạo?
- Cơ hội việc làm tại Việt Nam hiện tại như thế nào?
- Có những khóa học, chứng chỉ nào được khuyến nghị?`;
};

module.exports = { chat, buildExportContext };
