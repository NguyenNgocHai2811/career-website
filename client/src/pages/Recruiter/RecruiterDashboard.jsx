import React, { useState, useEffect, useRef } from 'react';
import { getDashboardMetrics, getMyCompanies, postJob, getApplicants, getMyJobs, updateApplicationStatus, createCompany, updateCompany, uploadCompanyLogo, getApplicantResumeDownloadUrl, updateJob, setJobStatus, deleteJob } from '../../services/recruiterService';
import { useNavigate, useLocation } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const JOB_CATEGORIES = ['IT', 'Kế toán', 'Bán hàng', 'Marketing', 'Nhân sự', 'Sản xuất', 'Thiết kế'];

const RecruiterDashboard = () => {
  const location = useLocation();
  const initialTab = new URLSearchParams(location.search).get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await getMyCompanies(token);
          setCompanies(data || []);
          if (data && data.length > 0) {
            const savedActive = localStorage.getItem('activeCompany');
            if (savedActive) {
              const parsed = JSON.parse(savedActive);
              const found = data.find(c => c.companyId === parsed.companyId);
              if (found) {
                setSelectedCompany(found);
                return;
              }
            }
            setSelectedCompany(data[0]);
          }
        } catch (err) {
          console.error("Error fetching companies:", err);
        }
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem('activeCompany', JSON.stringify(selectedCompany));
    }
  }, [selectedCompany]);

  // Close mobile menu on tab change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <div className="bg-[#FEF9F3] dark:bg-gray-900 min-h-screen text-[#1D1B18] dark:text-white font-sans relative overflow-x-hidden">
      {/* Decorative Pastel Bubbles */}
      <div className="fixed rounded-full blur-[80px] z-[-1] opacity-40 bg-[#E1F1FD] w-[300px] h-[300px] top-[10%] left-[5%]"></div>
      <div className="fixed rounded-full blur-[80px] z-[-1] opacity-40 bg-[#FDE1E1] w-[400px] h-[400px] bottom-[10%] right-[5%]"></div>
      
      <TopNav 
        navigate={navigate} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedCompany={selectedCompany}
        companies={companies}
        setSelectedCompany={setSelectedCompany}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Sidebar for Desktop / Drawer for Mobile */}
        <SideNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          selectedCompany={selectedCompany}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 relative ${activeTab === 'dashboard' ? '' : 'max-w-[1600px] mx-auto w-full'}`}>
          {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} selectedCompany={selectedCompany} />}
          {activeTab === 'post_job' && (
            <PostJob 
              setActiveTab={setActiveTab} 
              selectedCompany={selectedCompany} 
              companies={companies}
              setCompanies={setCompanies}
              setSelectedCompany={setSelectedCompany}
            />
          )}
          {activeTab === 'applicants' && <ApplicantList selectedCompany={selectedCompany} />}
          {activeTab === 'my_jobs' && <MyJobsList setActiveTab={setActiveTab} selectedCompany={selectedCompany} />}
          {activeTab === 'company_profile' && (
            <CompanyProfile 
              selectedCompany={selectedCompany} 
              setSelectedCompany={setSelectedCompany} 
              setCompanies={setCompanies}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const TopNav = ({ navigate, activeTab, setActiveTab, selectedCompany, companies, setSelectedCompany, setMobileMenuOpen }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FEF9F3]/80 dark:bg-gray-900/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-16 shadow-sm border-b border-[#dcdee4]/40 dark:border-gray-800">
      <div className="flex items-center gap-2 md:gap-8">
        {/* Mobile Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden size-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center size-8 md:size-10 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-xl md:text-2xl">diamond</span>
          </div>
          <h2 className="hidden sm:block text-[#2d3748] dark:text-white text-lg md:text-xl font-bold tracking-tight">
            Korra<span className="font-light text-primary">Careers</span>
          </h2>
        </div>
        
        {/* Company Context Indicator */}
        {selectedCompany && (
          <div className="hidden lg:flex items-center gap-4 pl-8 border-l border-gray-200 dark:border-gray-700 ml-4">
            <div 
              onClick={() => navigate(`/company/${selectedCompany.companyId}`)}
              className="size-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm group"
            >
              {selectedCompany.logoUrl ? (
                <img src={selectedCompany.logoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              ) : (
                <span className="font-bold text-lg text-primary">{selectedCompany.name?.[0]}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Brand</span>
              <div className="relative">
                <button 
                  onClick={() => companies.length > 1 && setShowCompanySwitcher(!showCompanySwitcher)}
                  className={`flex items-center gap-2 group ${companies.length > 1 ? 'cursor-pointer hover:text-primary transition-colors' : 'cursor-default'}`}
                >
                  <span className="text-sm font-bold text-[#1D1B18] dark:text-white">{selectedCompany.name}</span>
                  {companies.length > 1 && (
                    <span className={`material-symbols-outlined text-sm transition-transform ${showCompanySwitcher ? 'rotate-180' : ''}`}>expand_more</span>
                  )}
                </button>

                {showCompanySwitcher && (
                  <div className="absolute top-full left-0 mt-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[60] animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-700 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch Company</p>
                    </div>
                    {companies.map(c => (
                      <button
                        key={c.companyId}
                        onClick={() => {
                          setSelectedCompany(c);
                          setShowCompanySwitcher(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCompany.companyId === c.companyId ? 'bg-primary/5 text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                      >
                        <div className="size-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                          {c.logoUrl ? <img src={c.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xs">{c.name?.[0]}</span>}
                        </div>
                        <span className="text-sm font-bold truncate">{c.name}</span>
                        {selectedCompany.companyId === c.companyId && <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setActiveTab('post_job')} 
          className="hidden sm:flex min-w-[100px] md:min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-9 md:h-10 px-3 md:px-4 bg-primary text-white text-xs md:text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all"
        >
          <span>Create Job</span>
        </button>
        <button className="flex items-center justify-center rounded-xl size-9 md:size-10 bg-[#f1f1f4] dark:bg-gray-800 text-[#121317] dark:text-gray-300">
          <span className="material-symbols-outlined text-[20px] md:text-[24px]">notifications</span>
        </button>
        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full border-2 border-primary/20 bg-[#dee0ff] text-primary font-bold flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => selectedCompany?.companyId ? navigate(`/company/${selectedCompany.companyId}`) : navigate('/profile')}>
           {selectedCompany?.logoUrl ? (
             <img src={selectedCompany.logoUrl} className="w-full h-full object-cover" alt={selectedCompany.name}/>
           ) : user?.avatarUrl ? (
             <img src={user.avatarUrl} className="w-full h-full object-cover" alt="avatar"/>
           ) : (selectedCompany?.name?.charAt(0) || user?.fullName?.charAt(0) || 'R')}
        </div>
      </div>
    </nav>
  );
};

const SideNav = ({ activeTab, setActiveTab, selectedCompany, mobileMenuOpen, setMobileMenuOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 z-[70] md:z-30
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col pt-8 overflow-y-auto
      `}>
        <div className="px-6 mb-6 flex justify-between items-center">
          <div>
            <p className="font-sans tracking-widest uppercase text-[10px] font-bold text-gray-400">Management</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Recruitment Suite</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1">
          {[
            { id: 'dashboard', icon: 'account_tree', label: 'Pipeline' },
            { id: 'post_job', icon: 'add_business', label: 'Post Job' },
            { id: 'my_jobs', icon: 'work', label: 'My Jobs' },
            { id: 'applicants', icon: 'groups', label: 'Applicants' },
            { id: 'company_profile', icon: 'domain', label: 'Company Profile' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${activeTab === item.id ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {selectedCompany && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                {selectedCompany.logoUrl ? <img src={selectedCompany.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xs text-primary">{selectedCompany.name?.[0]}</span>}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active</p>
                <p className="text-xs font-bold truncate">{selectedCompany.name}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <button 
            onClick={() => setActiveTab('post_job')}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            Post New Job
          </button>
        </div>
      </aside>
    </>
  );
};

const DashboardOverview = ({ setActiveTab, selectedCompany }) => {
  const [metrics, setMetrics] = useState({ totalApplicants: 0, activeJobs: 0, hiredThisMonth: 0, recentApplicants: [] });
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem('token');
      if(token) {
        try {
           const data = await getDashboardMetrics(token);
           if(data) setMetrics(data);
        } catch (error) {
           console.error("Dashboard fetch error:", error);
        }
      }
    };
    fetchMetrics();
  }, []);

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="animate-fade-in-up">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-[#1d1b18] dark:text-white mb-2">Good morning, {user.fullName || 'Recruiter'}!</h1>
        <p className="text-sm md:text-base text-gray-500 font-medium">It's a great day to find some fresh talent {selectedCompany ? `for ${selectedCompany.name}` : 'for Korra'}.</p>
      </header>

      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-8">
        {/* Key Metrics */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="material-symbols-outlined text-blue-600">groups</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">+12%</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Applicants</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{metrics.totalApplicants}</h2>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="material-symbols-outlined text-orange-600">work</span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Jobs</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{metrics.activeJobs}</h2>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl border border-white dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="material-symbols-outlined text-purple-600">verified</span>
              </div>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hired</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">{metrics.hiredThisMonth}</h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 md:gap-4">
          <button onClick={() => setActiveTab('post_job')} className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl hover:bg-primary hover:text-white group transition-all">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg group-hover:bg-white/20 group-hover:text-white">post_add</span>
              <span className="font-bold text-sm">Create New Job</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button onClick={() => setActiveTab('applicants')} className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl hover:bg-secondary hover:text-white group transition-all">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-lg group-hover:bg-white/20 group-hover:text-white">groups</span>
              <span className="font-bold text-sm">View Applicants</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-1 lg:col-span-7 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-sm border border-white dark:border-gray-700">
           <div className="flex justify-between items-center mb-6 md:mb-8">
             <h3 className="text-lg font-bold">Pipeline</h3>
             <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-[10px] font-bold uppercase py-1 px-2 outline-none">
               <option>This Quarter</option>
               <option>Last Month</option>
             </select>
           </div>
           
           <div className="flex items-end justify-between h-40 md:h-48 gap-2 md:gap-4 px-2">
             {['Applied', 'Screening', 'Interview', 'Final'].map((label, idx) => (
               <div key={label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                 <div className={`w-full rounded-t-lg md:rounded-t-xl ${idx === 0 ? 'bg-blue-300' : idx === 1 ? 'bg-indigo-300' : idx === 2 ? 'bg-purple-300' : 'bg-pink-300'}`} 
                   style={{height: `${100 - idx * 25}%`}}></div>
                 <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate w-full text-center">{label}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="col-span-1 lg:col-span-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-sm border border-white dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Applicants</h3>
            <button onClick={() => setActiveTab('applicants')} className="text-primary text-xs font-bold uppercase border-b border-primary/20">View All</button>
          </div>
          <div className="space-y-3">
            {metrics.recentApplicants.length > 0 ? metrics.recentApplicants.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold overflow-hidden">
                    {app.avatarUrl ? <img src={app.avatarUrl} className="w-full h-full object-cover"/> : app.fullName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{app.fullName}</p>
                    <p className="text-[10px] text-gray-500 uppercase truncate">{app.jobTitle}</p>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full shrink-0">New</div>
              </div>
            )) : (
               <p className="text-xs text-gray-500 text-center py-4">No recent applicants.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Insight Section */}
      <div className="mt-6 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 md:p-10 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 border border-white dark:border-gray-700">
          <div className="flex-1 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">Insight of the Week</span>
            <h2 className="text-xl md:text-2xl font-bold mb-3">Talent Pool Insights</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Dữ liệu cho thấy xu hướng tăng 15% ứng viên về Generative AI. Hãy cân nhắc điều chỉnh tiêu chí tuyển dụng sắp tới.</p>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2">
              View Report
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </button>
          </div>
          <div className="hidden md:block w-48 h-48 bg-primary/5 rounded-full flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-6xl opacity-20">analytics</span>
          </div>
      </div>
    </div>
  );
};

const PostJob = ({ setActiveTab, selectedCompany, companies, setCompanies, setSelectedCompany }) => {
  const [form, setForm] = useState({ title: '', companyId: selectedCompany?.companyId || '', employmentType: 'Full-time', category: '', location: '', salaryMin: '', salaryMax: '', skills: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (selectedCompany) {
      setForm(prev => ({ ...prev, companyId: selectedCompany.companyId }));
    }
  }, [selectedCompany]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyId) {
      alert('Please select or create a company before posting.');
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      await postJob(token, form);
      alert('Job posted successfully!');
      setActiveTab('dashboard');
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-6 md:gap-8 animate-fade-in-up py-4 md:py-8">
      <div className="flex flex-col gap-2 md:gap-3">
        <span className="text-primary font-bold text-[10px] md:text-sm uppercase tracking-widest">Recruitment Suite</span>
        <h1 className="text-[#1D1B18] dark:text-white text-3xl md:text-5xl font-bold tracking-tight">Post a Job</h1>
        <p className="text-sm md:text-lg text-gray-500 font-medium">Create a high-impact listing to attract talent.</p>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-2xl md:rounded-[32px] p-6 md:p-10 border border-white dark:border-gray-700 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-10">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">domain</span>
              Identity
            </h3>

            {companies.length === 0 ? (
              <div className="p-6 md:p-8 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center text-center gap-4">
                <div className="size-12 md:size-16 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl md:text-3xl">add_business</span>
                </div>
                <div className="flex gap-2 w-full max-w-md mt-2 flex-col sm:flex-row">
                  <input type="text" id="newCompanyName" placeholder="Company name..." className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm outline-none dark:bg-gray-900"/>
                  <button type="button" onClick={() => {/* create logic */}} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl whitespace-nowrap">Create Now</button>
                </div>
              </div>
            ) : (
              <div className="p-4 md:p-6 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="size-12 md:size-14 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {selectedCompany?.logoUrl ? <img src={selectedCompany.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xl text-primary">{selectedCompany?.name?.[0]}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Posting as</p>
                    <h4 className="text-lg md:text-xl font-bold truncate">{selectedCompany?.name}</h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 uppercase tracking-tighter shrink-0">Verified Identity</span>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">work_history</span>
              Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Title</span>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Senior Frontend Developer"/>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employment Type</span>
                <select value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value})} className="w-full rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location</span>
                <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="w-full rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none" placeholder="e.g., San Francisco, CA"/>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
                <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none">
                  <option value="" disabled>Select job category</option>
                  {JOB_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skill Hints (Optional)</span>
                <input type="text" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="w-full rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none" placeholder="Auto-detected from JD, or add React, Node.js, SQL"/>
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Salary (USD)</span>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} className="flex-1 rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none"/>
                  <span className="text-gray-300">-</span>
                  <input type="number" placeholder="Max" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} className="flex-1 rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 h-12 px-4 text-sm font-medium outline-none"/>
                </div>
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</span>
              <textarea rows="6" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 rounded-xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Requirements, responsibilities..."></textarea>
            </label>
          </section>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 md:gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={() => setActiveTab('dashboard')} className="w-full sm:w-auto px-8 h-12 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">Cancel</button>
            <button type="submit" disabled={companies.length === 0 || isSubmitting} className="w-full sm:w-auto px-10 h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              {isSubmitting ? <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-xl">rocket_launch</span>}
              Post Job Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const STATUS_CONFIG = {
  PENDING: { icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  SHORTLISTED: { icon: 'star', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  INTERVIEWED: { icon: 'forum', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  HIRED: { icon: 'verified', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  REJECTED: { icon: 'block', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
};

const StatusDropdown = ({ currentStatus, onChangeStatus }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PENDING;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wider border flex items-center gap-1.5 transition-all hover:shadow-md ${cfg.bg} ${cfg.color}`}>
        <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
        {currentStatus || 'PENDING'}
        <span className="material-symbols-outlined text-[14px]">expand_more</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 min-w-[180px] py-1 animate-[fadeInUp_0.2s_ease-out]">
          {Object.entries(STATUS_CONFIG).map(([status, cfg2]) => (
            <button key={status} onClick={() => { onChangeStatus(status); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${currentStatus === status ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
              <span className={`material-symbols-outlined text-[18px] ${cfg2.color}`}>{cfg2.icon}</span>
              <span className="capitalize">{status.toLowerCase()}</span>
              {currentStatus === status && <span className="material-symbols-outlined text-primary text-[16px] ml-auto">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicantList = ({ selectedCompany }) => {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [filterMode, setFilterMode] = useState('All');
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [myJobs, setMyJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const [apps, jobs] = await Promise.all([
          getApplicants(token, jobFilter || null),
          getMyJobs(token),
        ]);
        const companyJobs = selectedCompany ? jobs.filter(j => j.company?.companyId === selectedCompany.companyId) : jobs;
        const jobIdsInCompany = new Set(companyJobs.map(j => j.jobId));
        const filteredApps = selectedCompany ? apps.filter(a => jobIdsInCompany.has(a.jobId)) : apps;
        setApplicants(filteredApps || []);
        setMyJobs(companyJobs || []);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [jobFilter, selectedCompany]);

  const handleStatusChange = async (app, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await updateApplicationStatus(token, { applicantId: app.id, jobId: app.jobId, status: newStatus });
      setApplicants(prev => prev.map(a => (a.id === app.id && a.jobId === app.jobId) ? { ...a, status: newStatus } : a));
    } catch (err) { alert(err.message); }
  };

  const handleViewResume = async (app) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const downloadUrl = await getApplicantResumeDownloadUrl(token, { applicantId: app.id, jobId: app.jobId });
      if (!downloadUrl) throw new Error('Resume URL not available');
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(err.message || 'Unable to open resume');
    }
  };

  const filtered = applicants
    .filter(a => filterMode === 'All' || (a.status || 'PENDING').toUpperCase() === filterMode)
    .filter(a => !search || a.fullName?.toLowerCase().includes(search.toLowerCase()) || a.jobTitle?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 h-full pb-10">
      {/* Mobile Filter Toggle */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold shadow-sm"
      >
        <span className="material-symbols-outlined">filter_list</span>
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      <aside className={`w-full lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'} animate-fade-in`}>
        <div className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white dark:border-gray-700 sticky top-20">
          <h3 className="font-bold text-lg mb-6 text-[#1D1B18] dark:text-white">Filter Candidates</h3>
          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Job Posting</p>
            <select 
              value={jobFilter} 
              onChange={e => setJobFilter(e.target.value)} 
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">All Active Jobs</option>
              {myJobs.map(j => <option key={j.jobId} value={j.jobId}>{j.title}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Status Pipeline</p>
            {['All', 'PENDING', 'SHORTLISTED', 'INTERVIEWED', 'HIRED', 'REJECTED'].map(m => (
              <button 
                key={m} 
                onClick={() => { setFilterMode(m); if(window.innerWidth < 1024) setShowFilters(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${filterMode === m ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600'}`}
              >
                <span className="capitalize">{m.toLowerCase()}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${filterMode === m ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {m === 'All' ? applicants.length : applicants.filter(a => (a.status || 'PENDING').toUpperCase() === m).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col gap-6">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary">search</span>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="w-full pl-12 pr-4 py-3.5 bg-white/70 dark:bg-gray-800/70 border border-white dark:border-gray-700 rounded-2xl shadow-sm text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all" 
            placeholder="Search candidates by name or role..."
          />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length > 0 ? filtered.map(app => (
            <div key={`${app.id}-${app.jobId}`} className="group bg-white dark:bg-gray-900 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
                <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center font-bold text-2xl shrink-0 shadow-inner">
                  {app.avatarUrl ? <img src={app.avatarUrl} className="w-full h-full object-cover rounded-2xl" /> : app.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg text-[#1D1B18] dark:text-white group-hover:text-primary transition-colors">{app.fullName}</h4>
                      <p className="text-sm text-gray-500 font-medium">Applied for <span className="text-primary font-bold">{app.jobTitle}</span></p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <StatusDropdown currentStatus={app.status || 'PENDING'} onChangeStatus={(s) => handleStatusChange(app, s)} />
                      <button
                        onClick={() =>
                          navigate('/messages', {
                            state: {
                              openChatUser: {
                                id: app.id,
                                fullName: app.fullName,
                                avatarUrl: app.avatarUrl,
                                headline: app.currentRole || '',
                              },
                            },
                          })
                        }
                        className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Nhắn tin ứng viên"
                      >
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </button>
                    </div>
                  </div>
                  
                  {app.coverLetter && (
                    <div className="mt-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 border border-gray-100 dark:border-gray-700">
                      <span className="font-bold text-gray-400 uppercase tracking-tighter block mb-1">Introduction:</span>
                      {app.coverLetter}
                    </div>
                  )}

                  <div className="mt-5 pt-5 border-t border-gray-50 dark:border-gray-800 flex flex-wrap items-center gap-3">
                    {app.cvUrl && (
                      <button onClick={() => handleViewResume(app)} className="px-4 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        View Resume
                      </button>
                    )}
                    {app.cvType === 'profile' && (
                      <a href={`/profile/${app.id}`} target="_blank" rel="noreferrer" className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold rounded-lg hover:bg-primary/10 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        Public Profile
                      </a>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto font-medium italic">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/40 dark:bg-gray-800/40 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="size-20 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-200">
                <span className="material-symbols-outlined text-5xl">person_search</span>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-lg">No candidates found</p>
                <p className="text-sm text-gray-400">Try adjusting your filters or search query.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const EMPTY_EDIT_FORM = { title: '', employmentType: 'Full-time', category: '', location: '', salaryMin: '', salaryMax: '', skills: '', description: '' };

const MyJobsList = ({ setActiveTab, selectedCompany }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuJobId, setMenuJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null); // job object being edited
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // jobId being acted on

  const loadJobs = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const allJobs = await getMyJobs(token);
      const filtered = selectedCompany ? allJobs.filter(j => j.company?.companyId === selectedCompany.companyId) : allJobs;
      setJobs(filtered);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, [selectedCompany]);

  const openEdit = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      employmentType: job.employmentType || 'Full-time',
      category: job.category || '',
      location: job.location || '',
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      skills: Array.isArray(job.skills) ? job.skills.map(skill => skill.name || skill).filter(Boolean).join(', ') : (job.skills || ''),
      description: job.description || '',
    });
    setMenuJobId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setSaving(true);
    try {
      const updated = await updateJob(token, editingJob.jobId, editForm);
      setJobs(prev => prev.map(j => j.jobId === editingJob.jobId ? { ...j, ...updated } : j));
      setEditingJob(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const token = localStorage.getItem('token');
    const newStatus = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    setActionLoading(job.jobId);
    setMenuJobId(null);
    try {
      const updated = await setJobStatus(token, job.jobId, newStatus);
      setJobs(prev => prev.map(j => j.jobId === job.jobId ? { ...j, ...updated } : j));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (job) => {
    if (!window.confirm(`Xóa vị trí "${job.title}"? Tất cả đơn ứng tuyển liên quan cũng sẽ bị xóa.`)) return;
    const token = localStorage.getItem('token');
    setActionLoading(job.jobId);
    setMenuJobId(null);
    try {
      await deleteJob(token, job.jobId);
      setJobs(prev => prev.filter(j => j.jobId !== job.jobId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto py-4 md:py-8" onClick={() => setMenuJobId(null)}>
      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingJob(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1d1b18] dark:text-white">Chỉnh sửa tin tuyển dụng</h3>
              <button onClick={() => setEditingJob(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tên vị trí *</span>
                <input required type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loại hình</span>
                  <select value={editForm.employmentType} onChange={e => setEditForm(f => ({ ...f, employmentType: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Remote</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ngành nghề</span>
                  <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none">
                    <option value="">Chọn ngành nghề</option>
                    {JOB_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Địa điểm</span>
                  <input type="text" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none" placeholder="Hà Nội, Remote..." />
                </label>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lương (USD)</span>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min" value={editForm.salaryMin} onChange={e => setEditForm(f => ({ ...f, salaryMin: e.target.value }))} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none" />
                  <span className="text-gray-300">–</span>
                  <input type="number" placeholder="Max" value={editForm.salaryMax} onChange={e => setEditForm(f => ({ ...f, salaryMax: e.target.value }))} className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none" />
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skill Hints (Optional)</span>
                <input type="text" value={editForm.skills} onChange={e => setEditForm(f => ({ ...f, skills: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 h-11 px-4 text-sm outline-none" placeholder="Auto-detected from JD, or add React, Node.js, SQL" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả</span>
                <textarea rows={5} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </label>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setEditingJob(null)} className="px-6 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Hủy</button>
                <button type="submit" disabled={saving} className="px-8 h-10 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-60 flex items-center gap-2 hover:bg-primary/90 transition-colors">
                  {saving && <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1d1b18] dark:text-white tracking-tight">Active Listings</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage and track your open opportunities.</p>
        </div>
        <button onClick={() => setActiveTab('post_job')} className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Post New Job
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading Jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-10 md:p-20 rounded-[40px] border border-white dark:border-gray-700 text-center flex flex-col items-center gap-6">
          <div className="size-24 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-5xl">work_off</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-bold mb-2">No listings yet</h3>
            <p className="text-gray-500 font-medium mb-8">Ready to grow your team? Post your first job opening and start receiving applications today.</p>
            <button onClick={() => setActiveTab('post_job')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Get Started</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => (
            <div key={job.jobId} className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-[32px] p-6 md:p-8 border border-white dark:border-gray-800 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 font-bold text-xl shadow-inner">
                      {job.company?.name?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1D1B18] dark:text-white group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{job.location || 'Remote'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-center border border-gray-100/50 dark:border-gray-700/50">
                    <p className="text-lg font-bold text-primary">{job.applicantCount}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tổng đơn ứng tuyển</p>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <button onClick={() => setActiveTab('applicants')} className="flex-1 px-4 py-3 bg-primary/5 text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all">Xem ứng viên</button>

                  {/* Action menu */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setMenuJobId(prev => prev === job.jobId ? null : job.jobId)}
                      disabled={actionLoading === job.jobId}
                      className="px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {actionLoading === job.jobId
                        ? <div className="size-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                        : <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                      }
                    </button>

                    {menuJobId === job.jobId && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-fade-in-up">
                        <button
                          onClick={() => openEdit(job)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-amber-500">
                            {job.status === 'ACTIVE' ? 'pause_circle' : 'play_circle'}
                          </span>
                          {job.status === 'ACTIVE' ? 'Đóng tin' : 'Mở lại'}
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                        <button
                          onClick={() => handleDelete(job)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Xóa tin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CompanyProfile = ({ selectedCompany, setSelectedCompany, setCompanies }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: selectedCompany?.name || '',
    industry: selectedCompany?.industry || '',
    size: selectedCompany?.size || '',
    location: selectedCompany?.location || '',
    website: selectedCompany?.website || '',
    description: selectedCompany?.description || '',
  });

  useEffect(() => {
    if (selectedCompany) {
      setFormData({
        name: selectedCompany.name || '',
        industry: selectedCompany.industry || '',
        size: selectedCompany.size || '',
        location: selectedCompany.location || '',
        website: selectedCompany.website || '',
        description: selectedCompany.description || '',
      });
    }
  }, [selectedCompany]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updated = await updateCompany(token, selectedCompany.companyId, formData);
      setSelectedCompany(updated);
      setCompanies(prev => prev.map(c => c.companyId === updated.companyId ? updated : c));
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedCompany) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const result = await uploadCompanyLogo(token, selectedCompany.companyId, file);
      const updated = { ...selectedCompany, logoUrl: result.logoUrl };
      setSelectedCompany(updated);
      setCompanies(prev => prev.map(c => c.companyId === updated.companyId ? updated : c));
      alert('Logo updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCompany) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">business</span>
      <h2 className="text-xl font-bold text-gray-500">No company profile selected.</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-[fadeInUp_0.5s_ease-out] py-8">
      <div className="flex flex-col gap-3 mb-10">
        <span className="text-primary font-bold text-sm uppercase tracking-widest">Brand Management</span>
        <h1 className="text-[#1D1B18] dark:text-white text-4xl font-bold font-display tracking-tight">Company Profile</h1>
        <p className="text-gray-500 font-medium">Customize your company's presence to attract top talent.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Col: Logo & Quick Info */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-gray-700 shadow-sm flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="size-32 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                {selectedCompany.logoUrl ? (
                  <img src={selectedCompany.logoUrl} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-5xl font-bold text-primary">{selectedCompany.name?.[0]}</span>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                <span className="material-symbols-outlined">photo_camera</span>
              </label>
            </div>
            <h3 className="font-bold text-xl mb-1">{selectedCompany.name}</h3>
            <p className="text-sm text-gray-500 font-medium mb-4">{selectedCompany.industry || 'Industry not set'}</p>
            <div className="w-full pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {selectedCompany.location || 'Location not set'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="material-symbols-outlined text-[16px]">language</span>
                {selectedCompany.website || 'No website'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Edit Form */}
        <div className="col-span-12 lg:col-span-8">
          <form onSubmit={handleUpdate} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-gray-700 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Company Name</label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Industry</label>
                <input 
                  value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g. Technology, Healthcare"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Company Size</label>
                <select 
                  value={formData.size}
                  onChange={e => setFormData({...formData, size: e.target.value})}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="1-10">1-10 Employees</option>
                  <option value="11-50">11-50 Employees</option>
                  <option value="51-200">51-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                  <option value="500+">500+ Employees</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Website</label>
                <input 
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Location</label>
              <input 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="City, Country"
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</label>
              <textarea 
                rows="4"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Tell candidates about your company..."
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span className="material-symbols-outlined text-sm">save</span>}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
