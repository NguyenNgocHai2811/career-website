import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { fetchStats } from '../../services/adminService';

const STAT_CONFIG = [
  { key: 'totalUsers',     label: 'Total Users',     icon: 'group',    accent: '#6C7EE1', link: '/admin/users' },
  { key: 'totalJobs',      label: 'Active Jobs',      icon: 'work',     accent: '#10b981', link: '/admin/jobs' },
  { key: 'totalPosts',     label: 'Posts',            icon: 'article',  accent: '#f59e0b', link: '/admin/posts' },
  { key: 'totalCompanies', label: 'Companies',        icon: 'business', accent: '#ef4444', link: '/admin/users' },
];

function StatCard({ label, value, icon, accent, link, loading }) {
  const content = (
    <div
      className="group relative bg-white rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
      style={{ borderColor: 'rgba(0,0,0,0.07)' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
        </div>
        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>north_east</span>
      </div>

      {loading ? (
        <>
          <div className="h-9 w-20 rounded-lg animate-pulse mb-2" style={{ background: '#f0f0f4' }} />
          <div className="h-3.5 w-24 rounded animate-pulse" style={{ background: '#f5f5f8' }} />
        </>
      ) : (
        <>
          <div className="text-[2rem] font-black tracking-tight leading-none" style={{ color: '#0c0c18' }}>
            {value?.toLocaleString() ?? '—'}
          </div>
          <div className="text-xs font-medium mt-1.5" style={{ color: '#9090a8' }}>{label}</div>
        </>
      )}

      <div className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: accent }} />
    </div>
  );

  return link ? <Link to={link} className="no-underline block">{content}</Link> : content;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
      <div className="min-h-screen" style={{ background: '#F4F4F7' }}>
        <div className="px-8 pt-8 pb-6 border-b bg-white" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: '#9090a8' }}>{dateStr}</p>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0c0c18' }}>Platform Overview</h1>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-semibold" style={{ borderColor: 'rgba(108,126,225,0.25)', color: '#6C7EE1', background: 'rgba(108,126,225,0.06)' }}>
              <span className="size-1.5 rounded-full inline-block animate-pulse" style={{ background: '#6C7EE1' }}></span>
              Live data
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="rounded-xl border px-5 py-4 text-sm font-medium flex items-center gap-3" style={{ background: '#fff5f5', borderColor: '#fecaca', color: '#ef4444' }}>
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] mb-4" style={{ color: '#9090a8' }}>Key Metrics</p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {STAT_CONFIG.map(({ key, label, icon, accent, link }) => (
                <StatCard
                  key={key}
                  label={label}
                  value={stats?.[key]}
                  icon={icon}
                  accent={accent}
                  link={link}
                  loading={loading}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] mb-4" style={{ color: '#9090a8' }}>Quick Actions</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Manage Users', desc: 'View, edit, or remove user accounts', icon: 'manage_accounts', link: '/admin/users', accent: '#6C7EE1' },
                { label: 'Review Jobs', desc: 'Moderate and manage job listings', icon: 'work_history', link: '/admin/jobs', accent: '#10b981' },
                { label: 'Moderate Posts', desc: 'Review community posts and reports', icon: 'rate_review', link: '/admin/posts', accent: '#f59e0b' },
              ].map(({ label, desc, icon, link, accent }) => (
                <Link key={link} to={link} className="no-underline group bg-white rounded-2xl p-5 border flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${accent}14` }}>
                    <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#0c0c18' }}>
                      {label}
                      <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }}>arrow_forward</span>
                    </div>
                    <div className="text-xs mt-0.5 leading-relaxed" style={{ color: '#9090a8' }}>{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
