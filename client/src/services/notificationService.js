const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1/notifications`;
const NOTIFICATION_CACHE_TTL_MS = 5000;
const notificationCache = new Map();

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchNotifications = async (token, limit = 20, skip = 0) => {
  const cacheKey = `${token}:${limit}:${skip}`;
  const now = Date.now();
  const cached = notificationCache.get(cacheKey);
  if (cached && now - cached.ts < NOTIFICATION_CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(`${API_URL}?limit=${limit}&skip=${skip}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    throw new Error('Failed to fetch notifications');
  }
  const data = await res.json();
  notificationCache.set(cacheKey, { data, ts: now });
  return data;
};

export const markAsRead = async (token, ids) => {
  const res = await fetch(`${API_URL}/mark-read`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('Failed to mark notifications as read');
  notificationCache.clear();
  return res.json();
};

export const markAllAsRead = async (token) => {
  const res = await fetch(`${API_URL}/mark-all-read`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark all notifications as read');
  notificationCache.clear();
  return res.json();
};
