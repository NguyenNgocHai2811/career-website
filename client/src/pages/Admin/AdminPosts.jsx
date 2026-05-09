import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { fetchPosts, deletePost, fetchReports, resolveReport } from '../../services/adminService';

const LIMIT = 20;

const REASON_COLORS = {
  'Spam': 'bg-yellow-100 text-yellow-700',
  'Thông tin sai lệch': 'bg-orange-100 text-orange-700',
  'Ngôn từ thù địch': 'bg-red-100 text-red-700',
  'Nội dung không phù hợp': 'bg-pink-100 text-pink-700',
  'Quấy rối': 'bg-purple-100 text-purple-700',
  'Khác': 'bg-gray-100 text-gray-600',
};

function ReportsTab({ token }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReports(token, { page, limit: LIMIT, status: 'PENDING' })
      .then(res => {
        if (cancelled) return;
        setReports(res.data || []);
        setTotal(res.meta?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [token, page, refreshKey]);

  const handleResolve = async (reportId, action) => {
    const label = action === 'DELETE_CONTENT' ? 'Xóa nội dung và đóng báo cáo?' : 'Bỏ qua báo cáo này?';
    if (!window.confirm(label)) return;
    try {
      await resolveReport(token, reportId, action);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Báo cáo chờ xử lý</h2>
        {total > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">{total}</span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Người báo cáo</th>
              <th className="px-5 py-3 text-left font-medium">Lý do</th>
              <th className="px-5 py-3 text-left font-medium">Nội dung bị báo cáo</th>
              <th className="px-5 py-3 text-left font-medium">Tác giả</th>
              <th className="px-5 py-3 text-left font-medium">Ngày</th>
              <th className="px-5 py-3 text-left font-medium">Xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-green-400 block mb-2">check_circle</span>
                <p className="text-sm text-gray-400">Không có báo cáo nào đang chờ xử lý</p>
              </td></tr>
            ) : reports.map(r => (
              <tr key={r.reportId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.reporterName || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${REASON_COLORS[r.reason] || 'bg-gray-100 text-gray-600'}`}>
                    {r.reason}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-[220px]">
                  <span className="line-clamp-2 text-xs">{r.targetContent?.substring(0, 100) || '—'}</span>
                </td>
                <td className="px-5 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs">{r.authorName || '—'}</td>
                <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(r.reportId, 'DELETE_CONTENT')}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors whitespace-nowrap"
                    >
                      Xóa nội dung
                    </button>
                    <button
                      onClick={() => handleResolve(r.reportId, 'DISMISS')}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                    >
                      Bỏ qua
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-4 justify-end">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Prev</button>
          <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}

export default function AdminPosts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reports'
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'ADMIN') {
      navigate('/login', { replace: true });
      return;
    }

    if (activeTab !== 'posts') return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPosts(token, { page, limit: LIMIT })
      .then(res => {
        if (cancelled) return;
        setPosts(res.data || []);
        setTotal(res.meta?.total || 0);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, refreshKey, activeTab]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Xóa post này? Hành động không thể hoàn tác.')) return;
    try {
      await deletePost(token, postId);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts & Moderation</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          {[
            { id: 'posts', label: 'Tất cả bài viết' },
            { id: 'reports', label: 'Báo cáo' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'reports' && <ReportsTab token={token} />}
        {activeTab === 'posts' && <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} bài viết</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Author</th>
                <th className="px-6 py-3 text-left font-medium">Content</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">No posts found</td>
                </tr>
              ) : posts.map(p => (
                <tr key={p.postId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {p.authorName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs">
                    <span className="line-clamp-2">
                      {p.content ? p.content.substring(0, 120) + (p.content.length > 120 ? '...' : '') : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(p.postId)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-4 mt-4 justify-end">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Prev</button>
            <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Next</button>
          </div>
        )}
        </div>}
      </div>
    </AdminLayout>
  );
}
