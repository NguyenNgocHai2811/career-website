const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export async function fetchStats(token) {
  const res = await fetch(`${API_BASE}/v1/admin/stats`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchUsers(token, { page = 1, limit = 20, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit, search });
  const res = await fetch(`${API_BASE}/v1/admin/users?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function banUser(token, userId, isBanned) {
  const res = await fetch(`${API_BASE}/v1/admin/users/${userId}/ban`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ isBanned }),
  });
  if (!res.ok) throw new Error('Failed to update user ban status');
  return res.json();
}

export async function deleteUser(token, userId) {
  const res = await fetch(`${API_BASE}/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function fetchJobs(token, { page = 1, limit = 20, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit, search });
  const res = await fetch(`${API_BASE}/v1/admin/jobs?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function deleteJob(token, jobId) {
  const res = await fetch(`${API_BASE}/v1/admin/jobs/${jobId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete job');
  return res.json();
}

export async function fetchPosts(token, { page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  const res = await fetch(`${API_BASE}/v1/admin/posts?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

export async function deletePost(token, postId) {
  const res = await fetch(`${API_BASE}/v1/admin/posts/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete post');
  return res.json();
}

export async function fetchReports(token, { page = 1, limit = 20, status = 'PENDING' } = {}) {
  const params = new URLSearchParams({ page, limit, status });
  const res = await fetch(`${API_BASE}/v1/admin/reports?${params}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function resolveReport(token, reportId, action) {
  const res = await fetch(`${API_BASE}/v1/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error('Failed to resolve report');
  return res.json();
}
