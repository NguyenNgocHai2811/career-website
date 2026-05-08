import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { fetchStats } from '../../services/adminService';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <span className="material-symbols-outlined text-white text-[22px]">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</div>
    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'ADMIN') {
      navigate('/login', { replace: true });
      return;
    }
    fetchStats(token)
      .then(res => setStats(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform overview</p>
        </div>
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="group" label="Total Users" value={stats.totalUsers} color="bg-primary" />
            <StatCard icon="work" label="Total Jobs" value={stats.totalJobs} color="bg-emerald-500" />
            <StatCard icon="article" label="Total Posts" value={stats.totalPosts} color="bg-amber-500" />
            <StatCard icon="business" label="Total Companies" value={stats.totalCompanies} color="bg-rose-500" />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
