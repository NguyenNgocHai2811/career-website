const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/account`;

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const parseResponse = async (response) => {
  let json = {};
  try {
    json = await response.json();
  } catch {
    json = {};
  }

  if (!response.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Account request failed');
  }

  return json;
};

export const getAccount = async (token) => {
  const response = await fetch(API_URL, { headers: authHeaders(token) });
  const result = await parseResponse(response);
  return result.data;
};

export const updateAccount = async (token, data) => {
  const response = await fetch(API_URL, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const result = await parseResponse(response);
  return result.data;
};

export const updateEmail = async (token, data) => {
  const response = await fetch(`${API_URL}/email`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return parseResponse(response);
};

export const requestEmailVerification = async (token) => {
  const response = await fetch(`${API_URL}/email/verification`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const result = await parseResponse(response);
  return result.data;
};

export const verifyEmail = async (verificationToken) => {
  const response = await fetch(`${API_URL}/email/verify?token=${encodeURIComponent(verificationToken)}`);
  return parseResponse(response);
};

export const changePassword = async (token, data) => {
  const response = await fetch(`${API_URL}/password`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return parseResponse(response);
};

export const updateNotificationPreferences = async (token, data) => {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  const result = await parseResponse(response);
  return result.data;
};

export const deactivateAccount = async (token, data) => {
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return parseResponse(response);
};
