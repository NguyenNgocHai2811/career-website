const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const COMPANY_CACHE_TTL_MS = 5000;
const companyCache = new Map();

export const getCompanyDetails = async (token, companyId) => {
  const cacheKey = `${token || 'anon'}:${companyId}`;
  const now = Date.now();
  const cached = companyCache.get(cacheKey);
  if (cached && now - cached.ts < COMPANY_CACHE_TTL_MS) {
    return cached.data;
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}/v1/companies/${companyId}`, { headers });
  const result = await response.json();
  if (response.status === 429) throw new Error('Too many requests. Please wait a moment and try again.');
  if (!response.ok) throw new Error(result.message || 'Lỗi tải công ty');
  companyCache.set(cacheKey, { data: result.data, ts: now });
  return result.data;
};

export const followCompany = async (token, companyId) => {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Không thể follow công ty');
  companyCache.clear();
  return response.json();
};

export const unfollowCompany = async (token, companyId) => {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}/follow`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Không thể unfollow công ty');
  companyCache.clear();
  return response.json();
};
