import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyDetails, followCompany, unfollowCompany } from '../../services/companyService';
import AppHeader from '../../components/AppHeader/AppHeader';
import PostItem from '../../components/PostItem/PostItem';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followed, setFollowed] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
  })();
  const activeCompany = (() => {
    try { return JSON.parse(localStorage.getItem('activeCompany')); } catch { return null; }
  })();

  const isOwner = currentUser.role === 'RECRUITER' && (
    currentUser.userId === company?.ownerId ||
    activeCompany?.companyId === companyId
  );

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getCompanyDetails(token, companyId);
        setCompany(data);
        setFollowed(data.isFollowing || false);
        setFollowerCount(data.followerCount || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [companyId, token]);

  useEffect(() => {
    if (activeTab !== 'posts' || !companyId) return;
    let cancelled = false;
    setPostsLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/v1/companies/${companyId}/posts`, { headers })
      .then(r => r.json())
      .then(data => { if (!cancelled) setPosts(data.data || []); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setPostsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, companyId, token]);

  const handleToggleLike = async (postId, type, isRemoving) => {
    if (!token) return;
    try {
      await fetch(`${API}/v1/posts/${postId}/reactions`, {
        method: isRemoving ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: isRemoving ? undefined : JSON.stringify({ type }),
      });
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const wasReacting = p.userReactionType === type;
        return {
          ...p,
          userReactionType: wasReacting ? null : type,
          reactionsCount: wasReacting ? p.reactionsCount - 1 : p.reactionsCount + 1,
          allTypes: wasReacting
            ? p.allTypes.filter((_, i) => i !== p.allTypes.lastIndexOf(type))
            : [...(p.allTypes || []), type],
        };
      }));
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppHeader />
      <div className="max-w-6xl mx-auto pt-24 px-4 md:px-8 space-y-4">
        <div className="bg-white rounded-3xl h-72 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-2xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppHeader />
      <div className="max-w-6xl mx-auto pt-28 px-4 text-center text-red-500 font-bold">{error}</div>
    </div>
  );

  if (!company) return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <AppHeader />
      <div className="max-w-6xl mx-auto pt-28 px-4 text-center text-gray-500 font-bold">Không tìm thấy công ty</div>
    </div>
  );

  const jobs = company.jobs || [];
  const employees = company.employees || [];

  const TABS = [
    { id: 'about', label: 'About', icon: 'info' },
    { id: 'posts', label: 'Posts', icon: 'article' },
    { id: 'jobs', label: 'Jobs', icon: 'work', count: jobs.length },
    { id: 'people', label: 'People', icon: 'group', count: employees.length },
  ];

  const handleFollow = async () => {
    if (!token) { alert('Vui lòng đăng nhập để follow công ty.'); return; }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (followed) {
        await unfollowCompany(token, companyId);
        setFollowed(false);
        setFollowerCount(c => Math.max(0, c - 1));
      } else {
        await followCompany(token, companyId);
        setFollowed(true);
        setFollowerCount(c => c + 1);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setFollowLoading(false);
    }
  };

  const Sidebar = () => (
    <aside className="space-y-4">
      {/* Info card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Thông tin công ty</p>
        <div className="space-y-3">
          {[
            { icon: 'category', label: 'Ngành', value: company.industry },
            { icon: 'group', label: 'Quy mô', value: company.size ? `${company.size} nhân viên` : null },
            { icon: 'location_on', label: 'Địa điểm', value: company.location },
            { icon: 'favorite', label: 'Theo dõi', value: `${followerCount} người` },
          ].filter(i => i.value).map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-400 text-[16px]">{item.icon}</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
              </div>
            </div>
          ))}
          {company.website && (
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-gray-400 text-[16px]">language</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">Website</p>
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-primary hover:underline truncate block"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs CTA */}
      {jobs.length > 0 && (
        <button
          onClick={() => setActiveTab('jobs')}
          className="w-full bg-gradient-to-br from-primary/10 to-indigo-100/60 dark:from-primary/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-primary/15 text-left group hover:from-primary/15 hover:to-indigo-100 transition-all"
        >
          <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Đang tuyển dụng</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{jobs.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">vị trí đang mở</p>
          <span className="mt-3 text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Xem tất cả <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </button>
      )}
    </aside>
  );

  return (
    <div className="bg-[#F5F5F7] dark:bg-gray-950 min-h-screen text-[#1D1B18] dark:text-white pb-20">
      <AppHeader />

      {isOwner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-primary text-white px-6 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Bạn đang xem trang công ty của mình
          </div>
          <button onClick={() => navigate('/recruiter')} className="flex items-center gap-1.5 text-sm font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Về Dashboard
          </button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 md:px-8 ${isOwner ? 'pt-28' : 'pt-20'}`}>

        {/* ── HEADER CARD ── */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">

          {/* Banner + logo overlap wrapper */}
          <div className="relative">
            {/* Banner */}
            <div className="h-44 md:h-56 overflow-hidden rounded-t-3xl">
              {company.bannerUrl
                ? <img src={company.bannerUrl} className="w-full h-full object-cover" alt="" />
                : <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #dde3ff 0%, #c7d2fe 40%, #e9d5ff 100%)' }} />
              }
            </div>

            {/* Logo — absolute so it's never clipped by banner's overflow-hidden */}
            <div className="absolute bottom-0 left-6 md:left-10 translate-y-1/2 z-10 size-20 md:size-24 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border-4 border-white dark:border-gray-800">
              {company.logoUrl
                ? <img src={company.logoUrl} className="w-full h-full object-contain rounded-xl" alt={company.name} />
                : <div className="w-full h-full rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-4xl">{company.name?.charAt(0)}</div>
              }
            </div>

            {/* Action buttons — absolute top-right of banner */}
            <div className="absolute bottom-3 right-6 md:right-10 flex gap-2">
              {company.website && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank" rel="noopener noreferrer"
                  className="h-9 px-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 text-sm font-bold hover:bg-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  Website
                </a>
              )}
              {!isOwner && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`h-9 px-5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 disabled:opacity-60 shadow-sm ${
                    followed
                      ? 'bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200 hover:bg-white'
                      : 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90'
                  }`}
                >
                  {followLoading
                    ? <div className="size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[15px]">{followed ? 'check' : 'add'}</span>
                  }
                  {followed ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="px-6 md:px-10 pb-0 pt-14">

            {/* Name + meta */}
            <h1 className="text-2xl md:text-[28px] font-black leading-tight mb-1">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-5">
              {company.industry && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">category</span>{company.industry}
                </span>
              )}
              {company.location && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>{company.location}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">group</span>{company.size} nhân viên
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">favorite</span>
                {followerCount} người theo dõi
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-t border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 px-4 text-sm font-bold flex items-center gap-1.5 border-b-2 shrink-0 transition-all ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA — all tabs use the same 2/3 + 1/3 grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            {activeTab === 'about' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                  Giới thiệu {company.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                  {company.description || 'Chưa có mô tả về công ty này.'}
                </p>
                {isOwner && !company.description && (
                  <button onClick={() => navigate('/recruiter')} className="mt-4 text-sm text-primary font-bold hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Thêm mô tả trong Dashboard
                  </button>
                )}
              </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
              postsLoading ? (
                <div className="flex justify-center py-16">
                  <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostItem
                      key={post.id}
                      post={post}
                      onToggleLike={handleToggleLike}
                      getAuthToken={() => token}
                      user={currentUser}
                      onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
                      onUpdate={(updated) => setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">article</span>
                  <p className="font-bold text-gray-500">Chưa có bài viết nào từ công ty này.</p>
                  {isOwner && (
                    <button onClick={() => navigate('/feed')} className="mt-3 text-sm text-primary font-bold hover:underline">
                      Đăng bài đầu tiên →
                    </button>
                  )}
                </div>
              )
            )}

            {/* Jobs */}
            {activeTab === 'jobs' && (
              jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.map(job => (
                    <Link
                      key={job.jobId}
                      to={`/jobs?jobId=${job.jobId}`}
                      className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-primary/30 transition-all group block no-underline"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{job.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-3">
                            {job.employmentType && <span>{job.employmentType}</span>}
                            {job.location && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">location_on</span>{job.location}</span>}
                          </p>
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="shrink-0 text-xs font-bold bg-primary/8 text-primary px-3 py-1.5 rounded-full">
                            {job.salaryMin ? `$${(job.salaryMin/1000).toFixed(0)}k` : ''}
                            {job.salaryMin && job.salaryMax ? ' – ' : ''}
                            {job.salaryMax ? `$${(job.salaryMax/1000).toFixed(0)}k` : ''}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Ứng tuyển <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">work_off</span>
                  <p className="font-bold text-gray-500">Chưa có vị trí tuyển dụng nào.</p>
                  {isOwner && (
                    <button onClick={() => navigate('/recruiter')} className="mt-3 text-sm text-primary font-bold hover:underline">
                      Đăng tin tuyển dụng →
                    </button>
                  )}
                </div>
              )
            )}

            {/* People */}
            {activeTab === 'people' && (
              employees.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {employees.map(u => (
                    <div
                      key={u.id}
                      onClick={() => navigate(`/profile/${u.id}`)}
                      className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all group"
                    >
                      <div className="size-12 rounded-xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                        {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" alt={u.fullName} /> : u.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{u.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{u.headline || u.role}</p>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-[18px]">arrow_forward_ios</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
                  <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">groups</span>
                  <p className="font-bold text-gray-500">Chưa có thành viên nào.</p>
                </div>
              )
            )}
          </div>

          {/* Sidebar — shows on all tabs */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
