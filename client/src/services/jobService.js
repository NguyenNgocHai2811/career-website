const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/jobs`;

export const getJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const qs = params.toString();
    const response = await fetch(`${API_URL}${qs ? `?${qs}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const getJobById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_URL}/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch job details');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

/**
 * Apply to a job.
 * @param {string} jobId
 * @param {'profile'|'file'} cvType - 'profile' = use logged-in profile as CV, 'file' = upload a file
 * @param {File|null} cvFile - only needed when cvType === 'file'
 * @param {string} token - auth JWT
 * @param {string} coverLetter - optional text
 */
export const saveJob = async (jobId, token) => {
  const response = await fetch(`${API_URL}/${jobId}/save`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to save job');
  return result;
};

export const unsaveJob = async (jobId, token) => {
  const response = await fetch(`${API_URL}/${jobId}/save`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to unsave job');
  return result;
};

export const getSavedJobs = async (token) => {
  const response = await fetch(`${API_URL}/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch saved jobs');
  const result = await response.json();
  return result.data;
};

export const applyToJob = async ({ jobId, cvType, cvFile, token, coverLetter = '' }) => {
  try {
    const formData = new FormData();
    formData.append('cvType', cvType);
    formData.append('coverLetter', coverLetter);
    if (cvType === 'file' && cvFile) {
      formData.append('cv', cvFile);
    }

    const response = await fetch(`${API_URL}/${jobId}/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // NOTE: Do NOT set Content-Type manually — browser sets multipart boundary automatically
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to apply');
    return result;
  } catch (error) {
    console.error('Error applying to job:', error);
    throw error;
  }
};
