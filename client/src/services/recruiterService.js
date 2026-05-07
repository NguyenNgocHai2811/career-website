const API_URL = '/v1/recruiter';

export const getDashboardMetrics = async (token) => {
  const response = await fetch(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
  const result = await response.json();
  return result.data;
};

export const getMyCompanies = async (token) => {
  const response = await fetch(`${API_URL}/companies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch companies');
  const result = await response.json();
  return result.data;
};

export const createCompany = async (token, companyName) => {
  const response = await fetch(`${API_URL}/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name: companyName })
  });
  if (!response.ok) throw new Error('Failed to create company');
  const result = await response.json();
  return result.data;
};

export const updateCompany = async (token, companyId, data) => {
  const response = await fetch(`${API_URL}/companies/${companyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update company');
  const result = await response.json();
  return result.data;
};

export const uploadCompanyLogo = async (token, companyId, file) => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`${API_URL}/companies/${companyId}/logo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload logo');
  const result = await response.json();
  return result.data;
};

export const postJob = async (token, jobData) => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to post job');
  return result;
};

export const getMyJobs = async (token) => {
  const response = await fetch(`${API_URL}/my-jobs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch my jobs');
  const result = await response.json();
  return result.data;
};

export const getApplicants = async (token, jobId = null) => {
  const url = jobId ? `${API_URL}/applicants?jobId=${jobId}` : `${API_URL}/applicants`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch applicants');
  const result = await response.json();
  return result.data;
};

export const updateApplicationStatus = async (token, { applicantId, jobId, status }) => {
  const response = await fetch(`${API_URL}/applications/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ applicantId, jobId, status }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to update status');
  return result;
};

