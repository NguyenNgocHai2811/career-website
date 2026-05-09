import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/jobs', label: 'Jobs', icon: 'work' },
  { to: '/admin/posts', label: 'Posts', icon: 'article' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex font-display" style={{ background: '#F4F4F7' }}>
      {/* ── SIDEBAR ── */}
      <aside className="w-56 shrink-0 flex flex-col" style={{ background: '#0c0c18', minHeight: '100vh' }}>
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-md flex items-center justify-center" style={{ background: '#6C7EE1' }}>
              <span className="material-symbols-outlined text-white text-sm">diamond</span>
            </div>
            <div>
              <div className="text-white text-sm font-bold tracking-tight leading-none">KorraCareers</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] px-3 pb-2 pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Navigation
          </div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(108,126,225,0.18)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                borderLeft: isActive ? '2px solid #6C7EE1' : '2px solid transparent',
              })}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-4 space-y-1 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="size-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: '#6C7EE1' }}>
              {(user.fullName || user.email || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user.fullName || 'Admin'}</div>
              <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email || ''}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'rgba(255,100,100,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,100,100,0.08)'; e.currentTarget.style.color = '#ff6464'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.7)'; }}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
