const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getCompanyDetails = async (token, companyId) => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}/v1/companies/${companyId}`, { headers });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Lỗi tải công ty');
  return result.data;
};

export const followCompany = async (token, companyId) => {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Không thể follow công ty');
  return response.json();
};

export const unfollowCompany = async (token, companyId) => {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}/follow`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Không thể unfollow công ty');
  return response.json();
};
