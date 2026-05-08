const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/ai`;

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
    this.isAuthError = true;
  }
}

const post = async (path, body, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (res.status === 401 || res.status === 403) {
    throw new AuthError('Phiên đăng nhập đã hết hạn.');
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Không nhận được phản hồi hợp lệ từ máy chủ.');
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'Lỗi từ máy chủ AI.');
  }

  return json.data;
};

export const fetchTasks = (token, payload) => post('/career-tasks', payload, token);
export const fetchSkills = (token, payload) => post('/career-skills', payload, token);
export const fetchIdentity = (token, payload) => post('/career-identity', payload, token);
export const fetchCareerPaths = (token, payload) => post('/career-paths', payload, token);
export const fetchCareerDetail = (token, payload) => post('/career-detail', payload, token);

export { AuthError };
