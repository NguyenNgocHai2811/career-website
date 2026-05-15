import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from '../NotificationBell/NotificationBell';

/**
 * AppHeader — Shared header for Feed and Profile pages.
 * Optimized for Premium Responsive Experience.
 */
const AppHeader = ({ activeTab = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close menus when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [activeTab, location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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
    { key: 'career-ai', label: '✦ Career Explorer', to: '/career-ai', guest: true },
  ];

  const navLinks = allNavLinks.filter(link => isLoggedIn || link.guest);

  if (isLoggedIn && user.role && user.role.toUpperCase() === 'CANDIDATE') {
    navLinks.push({ key: 'applications', label: 'Applications', to: '/applications' });
  }

  if (isLoggedIn && user.role && user.role.toUpperCase() === 'RECRUITER') {
    navLinks.push({ key: 'dashboard', label: 'Dashboard', to: '/recruiter' });
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200/60 bg-white/80 dark:bg-[#1e293b]/90 backdrop-blur-md px-4 md:px-6 py-3 shadow-sm">
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between">

        {/* Logo + Nav */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center gap-2 md:gap-3 no-underline">
            <div className="flex items-center justify-center size-8 md:size-10 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-xl md:text-2xl">diamond</span>
            </div>
            <h2 className="text-[#2d3748] dark:text-white text-lg md:text-xl font-bold tracking-tight">
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
        <div className="flex items-center gap-2 md:gap-4">
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
              <div className="scale-90 md:scale-100">
                <NotificationBell />
              </div>

              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 cursor-pointer group"
                  aria-label="User menu"
                >
                  <div className="size-8 md:size-9 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-primary transition-colors bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <img alt="Avatar" className="w-full h-full object-cover" src={user.avatar} />
                    ) : (
                      <span className="material-symbols-outlined text-gray-500 text-[18px] md:text-[20px]">{user.isCompany ? 'domain' : 'person'}</span>
                    )}
                  </div>
                  <span className="hidden sm:flex flex-col items-start">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors leading-tight">{user.fullName.split(' ')[0]}</span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in-up">
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
                    <div className="py-1">
                      <Link to={user.isCompany ? `/company/${user.companyId}` : `/profile/${user.userId}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline group">
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-primary transition-colors">{user.isCompany ? 'domain' : 'person'}</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{user.isCompany ? 'View Brand Page' : 'View Profile'}</span>
                      </Link>
                      {user.role && user.role.toUpperCase() === 'RECRUITER' && (
                        <Link to="/recruiter" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline group">
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
                      <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left group">
                        <span className="material-symbols-outlined text-[20px] text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-red-500 transition-colors">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/login" className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors no-underline px-2 md:px-4 py-2">Sign In</Link>
              <Link to="/register" className="text-xs md:text-sm font-bold bg-primary text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 no-underline">Sign Up</Link>
            </div>
          )}

          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center size-10 rounded-xl border border-primary/10 bg-primary/10 text-primary shadow-sm"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1000] md:hidden isolate">
          <div 
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-[88vw] max-w-[360px] bg-white dark:bg-[#1e293b] shadow-2xl animate-slide-in-right flex flex-col overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 no-underline">
                <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">diamond</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Korra<span className="font-light text-primary">Careers</span>
                </h3>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <nav className="shrink-0 p-4 space-y-2 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1e293b]">
              {navLinks.map(link => (
                <Link
                  key={link.key}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold no-underline transition-all
                    ${activeTab === link.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <span className="material-symbols-outlined">
                    {link.key === 'feed' ? 'rss_feed' : 
                     link.key === 'jobs' ? 'work' : 
                     link.key === 'network' ? 'group' : 
                     link.key === 'messages' ? 'chat' : 
                     link.key === 'career-ai' ? 'auto_awesome' :
                     link.key === 'dashboard' ? 'dashboard' : 'home'}
                  </span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-5 bg-gray-50 dark:bg-gray-900">
              {isLoggedIn ? (
                <>
                  <div className="mb-3 flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-3 shadow-sm">
                    <div className="size-10 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
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

                  <div className="mb-4 rounded-xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    <Link to={user.isCompany ? `/company/${user.companyId}` : `/profile/${user.userId}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">{user.isCompany ? 'domain' : 'person'}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.isCompany ? 'View Brand Page' : 'View Profile'}</span>
                    </Link>
                    {user.role && user.role.toUpperCase() === 'RECRUITER' && (
                      <Link to="/recruiter" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors no-underline">
                        <span className="material-symbols-outlined text-[20px] text-slate-400">dashboard</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dashboard</span>
                      </Link>
                    )}
                    <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full text-left">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Settings</span>
                    </button>
                    <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                      <span className="material-symbols-outlined text-[20px] text-slate-400">logout</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <Link to="/login" className="flex items-center justify-center rounded-xl h-10 bg-white dark:bg-gray-900 text-sm font-bold text-slate-700 dark:text-slate-200 no-underline shadow-sm">Sign In</Link>
                  <Link to="/register" className="flex items-center justify-center rounded-xl h-10 bg-primary text-sm font-bold text-white no-underline shadow-sm">Sign Up</Link>
                </div>
              )}
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Search</p>
              <div className="relative flex items-center mb-4">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
                <input
                  className="h-10 w-full rounded-xl border-none bg-white dark:bg-gray-900 text-sm pl-10 pr-4 focus:ring-2 focus:ring-primary/50 shadow-sm outline-none"
                  placeholder="Search jobs, people..."
                  type="text"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
