const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/jobs/applications`;

export const getMyApplications = async (token, filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== '') params.append(key, filters[key]);
  });
  const qs = params.toString();
  const response = await fetch(`${API_URL}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch applications');
  const result = await response.json();
  return result.data;
};

export const createExternalApplication = async (token, data) => {
  const response = await fetch(`${API_URL}/external`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || 'Failed to create external application');
  }
  const result = await response.json();
  return result.data;
};

export const updateMyApplication = async (token, jobId, data) => {
  const response = await fetch(`${API_URL}/${jobId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || 'Failed to update application');
  }
  const result = await response.json();
  return result.data;
};

export const archiveMyApplication = async (token, jobId, archived = true) => {
  const response = await fetch(`${API_URL}/${jobId}/archive`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ archived }),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || 'Failed to archive application');
  }
  const result = await response.json();
  return result.data;
};
