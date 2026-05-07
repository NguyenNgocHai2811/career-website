/**
 * Ollama local LLM provider — fallback when Gemini quota is exceeded.
 * Requires Ollama to be running locally: https://ollama.com
 * Default model: llama3 (configurable via OLLAMA_MODEL env var)
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Sends a multi-turn conversation to Ollama and returns the text response.
 * @param {Array<{role: 'user'|'model', text: string}>} messages
 * @returns {Promise<string>}
 */
const chat = async (messages) => {
  const ollamaMessages = messages.map(m => ({
    role: m.role === 'model' ? 'assistant' : 'user',
    content: m.text
  }));

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: ollamaMessages,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.message?.content || '';
};

module.exports = { chat };
