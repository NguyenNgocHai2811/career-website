import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../NotificationBell/NotificationBell';

/**
 * AppHeader — Shared header for Feed and Profile pages.
 * Props:
 *   - activeTab: 'feed' | 'profile' | 'jobs' | 'network' | null
 */
const AppHeader = ({ activeTab = null }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load user from localStorage
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; }
    catch { return {}; }
  })();

  // Logic for Recruiter IS Company
  const activeCompany = (() => {
    if (storedUser.role?.toUpperCase() === 'RECRUITER') {
      try { 
        const localActive = JSON.parse(localStorage.getItem('activeCompany'));
        return localActive || storedUser.activeCompany; 
      }
      catch { return storedUser.activeCompany || null; }
    }
    return null;
  })();

  const user = {
    userId: storedUser.userId || '',
    fullName: (storedUser.role?.toUpperCase() === 'RECRUITER' && activeCompany) ? activeCompany.name : (storedUser.fullName || 'Guest'),
    role: (storedUser.role?.toUpperCase() === 'RECRUITER' && activeCompany) ? activeCompany.industry : (storedUser.role || ''),
    avatar: (storedUser.role?.toUpperCase() === 'RECRUITER' && activeCompany) ? activeCompany.logoUrl : (storedUser.avatarUrl || storedUser.avatar || null),
    isCompany: storedUser.role?.toUpperCase() === 'RECRUITER',
    companyId: activeCompany?.companyId
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Check if logged in
  const isLoggedIn = !!localStorage.getItem('token');

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const allNavLinks = [
    { key: 'home', label: 'Home', to: '/', guest: true },
    { key: 'feed', label: 'Feed', to: '/feed', guest: false },
    { key: 'jobs', label: 'Jobs', to: '/jobs', guest: true },
    { key: 'network', label: 'Network', to: '/network', guest: false },
    { key: 'messages', label: 'Messages', to: '/messages', guest: false },
    { key: 'career-ai', label: '✦ Career AI', to: '/career-ai', guest: true },
  ];

  const navLinks = allNavLinks.filter(link => isLoggedIn || link.guest);

  if (isLoggedIn && user.role && user.role.toUpperCase() === 'RECRUITER') {
    navLinks.push({ key: 'dashboard', label: 'Dashboard', to: '/recruiter' });
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200/60 bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-md px-6 py-3 shadow-sm">
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between">

        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <h2 className="text-[#2d3748] dark:text-white text-xl font-bold tracking-tight">
              Korra<span className="font-light text-primary">Careers</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.key}
                to={link.to}
                className={`text-sm font-semibold transition-colors no-underline relative
                  ${activeTab === link.key
                    ? 'text-primary after:content-[""] after:absolute after:-bottom-[22px] after:left-0 after:w-full after:h-[3px] after:bg-primary after:rounded-t-full'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden lg:flex relative items-center">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
            <input
              className="h-9 w-56 rounded-lg border-none bg-gray-100 dark:bg-gray-800 text-sm pl-10 pr-4 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>

          {isLoggedIn ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Avatar + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 cursor-pointer group"
                  aria-label="User menu"
                >
                  <div className="size-9 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary transition-colors bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <img alt="Avatar" className="w-full h-full object-cover" src={user.avatar} />
                    ) : (
                      <span className="material-symbols-outlined text-gray-500 text-[20px]">{user.isCompany ? 'domain' : 'person'}</span>
                    )}
                  </div>
                  <span className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors leading-tight">{user.fullName.split(' ')[0]}</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in-up">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                          {user.avatar ? (
                            <img alt="Avatar" className="w-full h-full object-cover" src={user.avatar} />
                          ) : (
                            <span className="material-symbols-outlined text-gray-500">{user.isCompany ? 'domain' : 'person'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.fullName}</p>
                          <p className="text-xs text-slate-500 truncate">{user.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to={user.isCompany ? `/company/${user.companyId}` : `/profile/${user.userId}`}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline group"
                      >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">{user.isCompany ? 'domain' : 'person'}</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                          {user.isCompany ? 'View Brand Page' : 'View Profile'}
                        </span>
                      </Link>
                      {user.role && user.role.toUpperCase() === 'RECRUITER' && (
                        <Link
                          to="/recruiter"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline group"
                        >
                          <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">dashboard</span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Dashboard</span>
                        </Link>
                      )}
                      <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left group">
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">settings</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left group"
                      >
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition-colors">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors no-underline px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 no-underline"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AppHeader;
