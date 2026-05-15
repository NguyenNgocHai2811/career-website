const DEEPSEEK_BASE_URL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

/**
 * Sends a multi-turn conversation to DeepSeek and returns the text response.
 * @param {Array<{role: 'user'|'model', text: string}>} messages
 * @returns {Promise<string>}
 */
const chat = async (messages) => {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('No DeepSeek API key configured');
  }

  const deepseekMessages = messages.map(m => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.text,
  }));

  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: deepseekMessages,
      response_format: { type: 'json_object' },
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek error: ${response.status} ${response.statusText} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
};

module.exports = { chat };
