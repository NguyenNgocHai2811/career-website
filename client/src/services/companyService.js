const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getCompanyDetails = async (token, companyId) => {
  const response = await fetch(`${API_URL}/v1/companies/${companyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Lỗi tải công ty');
  return result.data;
};
