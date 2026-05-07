const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/chat`;

export const getRecentChats = async (token) => {
  const response = await fetch(`${API_URL}/recent`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch recent chats');
  const result = await response.json();
  return result.data;
};

export const getChatHistory = async (token, friendId) => {
  const response = await fetch(`${API_URL}/history/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch chat history');
  const result = await response.json();
  return result.data;
};
