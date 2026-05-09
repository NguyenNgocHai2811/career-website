import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyDetails } from '../../services/companyService';
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [companyId, token]);

  // Fetch posts when Posts tab is selected and we have the owner's userId
  useEffect(() => {
    if (activeTab !== 'posts' || !company?.ownerId) return;
    let cancelled = false;
    setPostsLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/v1/users/${company.ownerId}/posts`, { headers })
      .then(r => r.json())
      .then(data => { if (!cancelled) setPosts(data.posts || []); })
      .catch(() => { if (!cancelled) setPosts([]); })
      .finally(() => { if (!cancelled) setPostsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, company?.ownerId, token]);

  const handleToggleLike = () => {};

  if (loading) return (
    <div className="min-h-screen bg-[#FEF9F3]">
      <AppHeader />
      <div className="max-w-300 mx-auto pt-28 px-4 flex flex-col gap-6">
        <div className="bg-white rounded-2xl h-64 animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-2xl h-48 animate-pulse" />
          <div className="bg-white rounded-2xl h-48 animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FEF9F3]">
      <AppHeader />
      <div className="max-w-300 mx-auto pt-28 px-4 text-center text-red-500 font-bold">{error}</div>
    </div>
  );

  if (!company) return (
    <div className="min-h-screen bg-[#FEF9F3]">
      <AppHeader />
      <div className="max-w-300 mx-auto pt-28 px-4 text-center text-gray-500 font-bold">Không tìm thấy công ty</div>
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

  return (
    <div className="bg-[#FEF9F3] dark:bg-gray-950 min-h-screen text-[#1D1B18] dark:text-white font-body pb-20">
      <AppHeader />

      {isOwner && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-primary/95 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Bạn đang xem trang công ty của mình
          </div>
          <button
            onClick={() => navigate('/recruiter')}
            className="flex items-center gap-1.5 text-sm font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Về Dashboard
          </button>
        </div>
      )}

      <div className={`max-w-300 mx-auto px-4 md:px-8 ${isOwner ? 'pt-28' : 'pt-20'}`}>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#ece7e2] dark:border-gray-800 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-40 md:h-52 relative overflow-hidden">
            {company.bannerUrl ? (
              <img src={company.bannerUrl} className="w-full h-full object-cover" alt="banner" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/20 via-indigo-100 to-purple-100 dark:from-primary/30 dark:via-indigo-900/30 dark:to-purple-900/30" />
            )}
          </div>

          <div className="px-6 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row gap-4 md:items-end -mt-14 mb-4">
              {/* Logo */}
              <div className="size-24 md:size-28 bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-100 dark:border-gray-700 relative z-10 shrink-0">
                <div className="w-full h-full rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-4xl overflow-hidden">
                  {company.logoUrl
                    ? <img src={company.logoUrl} className="w-full h-full object-cover" alt={company.name} />
                    : company.name?.charAt(0)}
                </div>
              </div>

              {/* Name + meta */}
              <div className="flex-1 min-w-0 mt-2 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-black font-display truncate">{company.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {company.industry && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">category</span>
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {company.location}
                    </span>
                  )}
                  {company.size && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      {company.size} employees
                    </span>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0 flex-wrap">
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Website
                  </a>
                )}

                {!isOwner && (
                  <button
                    onClick={() => setFollowed(f => !f)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                      followed
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        : 'bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{followed ? 'check' : 'add'}</span>
                    {followed ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 mt-4 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-3 text-sm font-bold transition-all flex items-center gap-1.5 border-b-2 -mb-px shrink-0 ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-[#1D1B18] dark:hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts tab — full width, no sidebar */}
        {activeTab === 'posts' && (
          <div className="max-w-2xl mx-auto animate-[fadeInUp_0.4s_ease-out]">
            {postsLoading ? (
              <div className="flex justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
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
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-sm border border-[#ece7e2] dark:border-gray-800 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">article</span>
                <p className="font-bold text-gray-500">No posts from this company yet.</p>
                {isOwner && (
                  <button onClick={() => navigate('/feed')} className="mt-3 text-sm text-primary font-bold hover:underline">
                    Share something on the feed →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Other tabs — 2/3 + sidebar layout */}
        {activeTab !== 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-[#ece7e2] dark:border-gray-800 animate-[fadeInUp_0.4s_ease-out]">
                  <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    About {company.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                    {company.description || 'No company description yet.'}
                  </p>
                  {isOwner && !company.description && (
                    <button
                      onClick={() => navigate('/recruiter')}
                      className="mt-4 text-sm text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Add a description in your dashboard
                    </button>
                  )}
                </div>
              )}

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div className="flex flex-col gap-4 animate-[fadeInUp_0.4s_ease-out]">
                  {jobs.length > 0 ? jobs.map(job => (
                    <Link
                      key={job.jobId}
                      to="/jobs"
                      className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-[#ece7e2] dark:border-gray-800 hover:shadow-md hover:border-primary/20 transition-all group no-underline"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-[#1D1B18] dark:text-white group-hover:text-primary transition-colors">{job.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-x-3">
                            {job.employmentType && <span>{job.employmentType}</span>}
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {job.location}
                              </span>
                            )}
                          </p>
                        </div>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="shrink-0 text-xs font-bold bg-primary/5 text-primary px-3 py-1 rounded-full">
                            {job.salaryMin && job.salaryMax
                              ? `$${Number(job.salaryMin).toLocaleString()} – $${Number(job.salaryMax).toLocaleString()}`
                              : job.salaryMin
                                ? `From $${Number(job.salaryMin).toLocaleString()}`
                                : `Up to $${Number(job.salaryMax).toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          {job.postedAt ? new Date(job.postedAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Apply now <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </span>
                      </div>
                    </Link>
                  )) : (
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-sm border border-[#ece7e2] dark:border-gray-800 text-center">
                      <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">work_off</span>
                      <p className="font-bold text-gray-500">No active jobs posted at the moment.</p>
                      {isOwner && (
                        <button onClick={() => navigate('/recruiter')} className="mt-3 text-sm text-primary font-bold hover:underline">
                          Post a job from your dashboard →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* People Tab */}
              {activeTab === 'people' && (
                <div className="animate-[fadeInUp_0.4s_ease-out]">
                  {employees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {employees.map(user => (
                        <div
                          key={user.id}
                          onClick={() => navigate(`/profile/${user.id}`)}
                          className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-[#ece7e2] dark:border-gray-800 flex items-center gap-4 hover:shadow-md hover:border-primary/20 cursor-pointer transition-all group"
                        >
                          <div className="size-12 rounded-xl overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {user.avatarUrl
                              ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt={user.fullName} />
                              : user.fullName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{user.fullName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.headline || user.role}</p>
                          </div>
                          <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-[18px]">arrow_forward_ios</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-sm border border-[#ece7e2] dark:border-gray-800 text-center">
                      <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 block mb-3">groups</span>
                      <p className="font-bold text-gray-500">No team members listed yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-[#ece7e2] dark:border-gray-800">
                <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">Company Info</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'category', label: 'Industry', value: company.industry },
                    { icon: 'group', label: 'Company size', value: company.size },
                    { icon: 'location_on', label: 'Location', value: company.location },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-gray-400 text-[18px]">{item.icon}</span>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.label}</p>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {company.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-gray-400 text-[18px]">language</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Website</p>
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline truncate block"
                        >
                          {company.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {jobs.length > 0 && (
                <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-5 border border-primary/10">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Hiring</p>
                  <p className="text-2xl font-black text-[#1D1B18] dark:text-white">{jobs.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">open position{jobs.length !== 1 ? 's' : ''}</p>
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfile;
