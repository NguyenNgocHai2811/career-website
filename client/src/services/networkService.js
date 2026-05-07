const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getMyConnections = async (token) => {
  const res = await fetch(`${API_URL}/v1/network/connections`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const getPendingRequests = async (token) => {
  const res = await fetch(`${API_URL}/v1/network/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const sendConnectionRequest = async (token, receiverId) => {
  const res = await fetch(`${API_URL}/v1/network/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ receiverId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const acceptConnectionRequest = async (token, senderId) => {
  const res = await fetch(`${API_URL}/v1/network/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ senderId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const rejectConnectionRequest = async (token, senderId) => {
  const res = await fetch(`${API_URL}/v1/network/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ senderId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const searchUsersToConnect = async (token, query) => {
  const res = await fetch(`${API_URL}/v1/network/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.data;
};

export const removeConnection = async (token, friendId) => {
  const res = await fetch(`${API_URL}/v1/network/disconnect`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ friendId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
