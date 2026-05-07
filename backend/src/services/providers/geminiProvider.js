const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Sends a multi-turn conversation to Google Gemini and returns the text response.
 * @param {Array<{role: 'user'|'model', text: string}>} messages
 * @returns {Promise<string>}
 */
const chat = async (messages) => {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // Convert messages array to Gemini content format
  const contents = messages.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  });

  return response.text;
};

module.exports = { chat };
