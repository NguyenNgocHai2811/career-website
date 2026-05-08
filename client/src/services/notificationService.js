const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/notifications`;

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchNotifications = async (token, limit = 20, skip = 0) => {
  const res = await fetch(`${API_URL}?limit=${limit}&skip=${skip}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markAsRead = async (token, ids) => {
  const res = await fetch(`${API_URL}/mark-read`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to mark notifications as read');
  return res.json();
};

export const markAllAsRead = async (token) => {
  const res = await fetch(`${API_URL}/mark-all-read`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
  return res.json();
};
