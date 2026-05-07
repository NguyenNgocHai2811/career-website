import React, { useState, useEffect, useRef } from 'react';
import { getDashboardMetrics, getMyCompanies, postJob, getApplicants, getMyJobs, updateApplicationStatus, createCompany, updateCompany, uploadCompanyLogo } from '../../services/recruiterService';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';


const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await getMyCompanies(token);
          setCompanies(data || []);
          if (data && data.length > 0) {
            // Check if there's a previously selected company in localStorage
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
      />
      
      <div className="flex pt-16 h-screen overflow-hidden">
        {activeTab === 'dashboard' && (
          <SideNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            selectedCompany={selectedCompany}
          />
        )}
        
        <main className={`flex-1 overflow-y-auto p-8 relative ${activeTab === 'dashboard' ? '' : 'max-w-[1600px] mx-auto w-full'}`}>
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

const TopNav = ({ navigate, activeTab, setActiveTab, selectedCompany, companies, setSelectedCompany }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [showCompanySwitcher, setShowCompanySwitcher] = useState(false);
  
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FEF9F3]/80 dark:bg-gray-900/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-sm shadow-[#ece7e2]/50 dark:shadow-none border-b border-[#dcdee4]/40 dark:border-gray-800">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">diamond</span>
          </div>
          <h2 className="text-[#2d3748] dark:text-white text-xl font-bold tracking-tight">
            Korra<span className="font-light text-primary">Careers</span>
          </h2>
        </div>
        
        {/* Company Context Indicator */}
        {selectedCompany && (
          <div className="hidden lg:flex items-center gap-4 pl-8 border-l border-gray-200 dark:border-gray-700 ml-4">
            {/* Clickable Company Logo (Public View) */}
            <div 
              onClick={() => navigate(`/company/${selectedCompany.companyId}`)}
              className="size-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm group"
              title="View Public Profile"
            >
              {selectedCompany.logoUrl ? (
                <img src={selectedCompany.logoUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
              ) : (
                <span className="font-bold text-lg text-primary">{selectedCompany.name?.[0]}</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Recruiting for</span>
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
                  <div className="absolute top-full left-0 mt-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-[60] animate-[fadeInUp_0.2s_ease-out]">
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

      <div className="flex items-center gap-4">
        {activeTab !== 'post_job' && (
           <button onClick={() => setActiveTab('post_job')} className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
             <span>Create Job</span>
           </button>
        )}
        <button className="flex items-center justify-center rounded-xl size-10 bg-[#f1f1f4] dark:bg-gray-800 text-[#121317] dark:text-gray-300 hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="flex items-center justify-center rounded-xl size-10 bg-[#f1f1f4] dark:bg-gray-800 text-[#121317] dark:text-gray-300 hover:bg-gray-200 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 bg-[#dee0ff] text-primary font-bold flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => navigate('/profile')}>
           {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" alt="user avatar"/> : (user?.fullName?.charAt(0) || 'R')}
        </div>
      </div>
    </nav>
  );
};

const SideNav = ({ activeTab, setActiveTab, selectedCompany }) => {
  return (
    <aside className="w-64 bg-[#f8f3ed]/40 dark:bg-zinc-800/50 backdrop-blur-2xl flex flex-col pt-8 border-r border-[#ece7e2] dark:border-gray-800 h-full overflow-y-auto hidden md:flex">
      <div className="px-6 mb-6">
        <p className="font-sans tracking-widest uppercase text-[10px] font-bold text-gray-400">Management</p>
        <p className="text-xs text-gray-500 font-medium mt-1">Recruitment Suite</p>
      </div>
      <nav className="flex-1">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white/80 dark:bg-zinc-700/80 text-primary border-l-4 border-orange-300 translate-x-1' : 'text-gray-500 hover:bg-white/40 dark:hover:bg-zinc-700/40 hover:translate-x-1'}`}
        >
          <span className="material-symbols-outlined">account_tree</span>
          <span className="text-sm font-medium">Pipeline</span>
        </button>
        <button 
          onClick={() => setActiveTab('my_jobs')}
          className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${activeTab === 'my_jobs' ? 'bg-white/80 dark:bg-zinc-700/80 text-primary border-l-4 border-orange-300 translate-x-1' : 'text-gray-500 hover:bg-white/40 dark:hover:bg-zinc-700/40 hover:translate-x-1'}`}
        >
          <span className="material-symbols-outlined">work</span>
          <span className="text-sm font-medium">My Jobs</span>
        </button>
        <button 
          onClick={() => setActiveTab('applicants')}
          className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${activeTab === 'applicants' ? 'bg-white/80 dark:bg-zinc-700/80 text-primary border-l-4 border-orange-300 translate-x-1' : 'text-gray-500 hover:bg-white/40 dark:hover:bg-zinc-700/40 hover:translate-x-1'}`}
        >
          <span className="material-symbols-outlined">groups</span>
          <span className="text-sm font-medium">Applicants</span>
        </button>
        <button 
          onClick={() => setActiveTab('company_profile')}
          className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${activeTab === 'company_profile' ? 'bg-white/80 dark:bg-zinc-700/80 text-primary border-l-4 border-orange-300 translate-x-1' : 'text-gray-500 hover:bg-white/40 dark:hover:bg-zinc-700/40 hover:translate-x-1'}`}
        >
          <span className="material-symbols-outlined">domain</span>
          <span className="text-sm font-medium">Company Profile</span>
        </button>
        <button className="w-full flex items-center gap-3 text-gray-500 px-6 py-4 hover:bg-white/40 dark:hover:bg-zinc-700/40 hover:translate-x-1 transition-all duration-200">
          <span className="material-symbols-outlined">equalizer</span>
          <span className="text-sm font-medium">Analytics</span>
        </button>
      </nav>
      
      {/* Active Company Indicator in SideNav */}
      {selectedCompany && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {selectedCompany.logoUrl ? <img src={selectedCompany.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xs text-primary">{selectedCompany.name?.[0]}</span>}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active</p>
              <p className="text-xs font-bold truncate dark:text-white">{selectedCompany.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <button 
          onClick={() => setActiveTab('post_job')}
          className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">add</span>
          Post New Job
        </button>
      </div>
    </aside>
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
    <div className="animate-[fadeInUp_0.5s_ease-out]">
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-[#1d1b18] dark:text-white mb-2">Good morning, {user.fullName || 'Recruiter'}!</h1>
        <p className="text-gray-500 font-medium">It's a great day to find some fresh talent {selectedCompany ? `for ${selectedCompany.name}` : 'for Korra'}.</p>
      </header>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Key Metrics */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-xl border-l-4 border-secondary shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#cfe5ff] dark:bg-[#cfe5ff]/20 rounded-lg">
                <span className="material-symbols-outlined text-[#3a6187] dark:text-[#a3caf5]">groups</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a6187] dark:text-[#a3caf5]">+12% vs last month</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Applicants</p>
            <h2 className="text-3xl font-bold font-serif mt-1">{metrics.totalApplicants}</h2>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-xl border-l-4 border-primary shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#dee0ff] dark:bg-[#dee0ff]/20 rounded-lg">
                <span className="material-symbols-outlined text-primary dark:text-[#bac3ff]">work</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Jobs</p>
            <h2 className="text-3xl font-bold font-serif mt-1">{metrics.activeJobs}</h2>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-xl border-l-4 border-[#7c429f] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#f4d9ff] dark:bg-[#f4d9ff]/20 rounded-lg">
                <span className="material-symbols-outlined text-[#7c429f] dark:text-[#e5b4ff]">verified</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7c429f] dark:text-[#e5b4ff]">Goal Reached</span>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Hired This Month</p>
            <h2 className="text-3xl font-bold font-serif mt-1">{metrics.hiredThisMonth}</h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <button onClick={() => setActiveTab('post_job')} className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary group transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg group-hover:bg-white/20 group-hover:text-white">post_add</span>
              <span className="font-bold">Create New Job</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
          <button onClick={() => setActiveTab('applicants')} className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl hover:bg-secondary hover:text-white dark:hover:bg-secondary group transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 rounded-lg group-hover:bg-white/20 group-hover:text-white">groups</span>
              <span className="font-bold">View Applicants</span>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-xl shadow-sm border border-white/40 dark:border-gray-700">
           <div className="flex justify-between items-center mb-8">
             <h3 className="font-serif text-xl font-bold">Recruitment Pipeline</h3>
             <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-xs font-bold uppercase py-1 px-3 focus:ring-primary outline-none">
               <option>This Quarter</option>
               <option>Last Month</option>
             </select>
           </div>
           
           <div className="flex items-end justify-between h-48 gap-4 px-4">
             <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
               <div className="w-full bg-[#a3caf5] rounded-t-xl" style={{height: '100%'}}></div>
               <span className="text-[10px] font-bold text-gray-500">APPLIED</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
               <div className="w-full bg-[#bac3ff] rounded-t-xl" style={{height: '65%'}}></div>
               <span className="text-[10px] font-bold text-gray-500">SCREENING</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
               <div className="w-full bg-[#e5b4ff] rounded-t-xl" style={{height: '40%'}}></div>
               <span className="text-[10px] font-bold text-gray-500">INTERVIEW</span>
             </div>
             <div className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
               <div className="w-full bg-[#abd3fe] rounded-t-xl" style={{height: '15%'}}></div>
               <span className="text-[10px] font-bold text-gray-500">FINAL</span>
             </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-xl shadow-sm border border-white/40 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold">Recent Applicants</h3>
            <button onClick={() => setActiveTab('applicants')} className="text-primary text-xs font-bold uppercase border-b border-primary/30">View All</button>
          </div>
          <div className="space-y-4">
            {metrics.recentApplicants.length > 0 ? metrics.recentApplicants.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dee0ff] text-primary flex items-center justify-center font-bold overflow-hidden border border-gray-100 dark:border-gray-600">
                    {app.avatarUrl ? <img src={app.avatarUrl} className="w-full h-full object-cover"/> : app.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{app.fullName}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">{app.jobTitle}</p>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/20">
                  New
                </div>
              </div>
            )) : (
               <p className="text-sm text-gray-500 text-center py-4">No recent applicants found.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Insight Section */}
      <div className="mt-6 w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-10 rounded-xl relative overflow-hidden flex items-center border border-white/40 dark:border-gray-700 bg-gradient-to-r from-[#f8f3ed]/50 to-[#fef9f3]/50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Insight of the Week</span>
            <h2 className="font-serif text-3xl font-bold mb-4">Talent Pool Insights</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">Dữ liệu từ tháng trước cho thấy xu hướng tăng 15% đối với các ứng viên có kinh nghiệm về Generative AI. Hãy cân nhắc việc điều chỉnh tiêu chí tuyển dụng cho các vị trí Engineering sắp tới.</p>
            <button className="bg-[#32302c] text-[#f5f0ea] px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
              View Detailed Report
              <span className="material-symbols-outlined text-sm">trending_up</span>
            </button>
          </div>
      </div>
    </div>
  );
};

const PostJob = ({ setActiveTab, selectedCompany, companies, setCompanies, setSelectedCompany }) => {
  const [form, setForm] = useState({ title: '', companyId: selectedCompany?.companyId || '', employmentType: 'Full-time', location: '', salaryMin: '', salaryMax: '', description: '' });
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
    <div className="w-full max-w-[900px] mx-auto flex flex-col gap-8 animate-[fadeInUp_0.5s_ease-out] py-8">
      <div className="flex flex-col gap-3">
        <span className="text-primary font-bold text-sm uppercase tracking-widest text-primary/80">Recruitment Suite</span>
        <h1 className="text-[#1D1B18] dark:text-white text-5xl font-bold font-display tracking-tight leading-tight">Post a New Job Opportunity</h1>
        <p className="text-gray-500 text-lg font-medium max-w-2xl">Create a high-impact job listing to attract the best talent.</p>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-[#4153b4]/5 p-10 border border-white dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          {/* Company Selection Section */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#1D1B18] dark:text-white flex items-center gap-2 font-display">
                <span className="material-symbols-outlined text-primary">domain</span>
                Identity
              </h3>
            </div>

            {companies.length === 0 ? (
              <div className="p-8 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center text-center gap-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="size-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">add_business</span>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-[#1D1B18] dark:text-white">No company profile found</h4>
                  <p className="text-sm text-gray-500 mt-1">Please create a company profile to start posting job opportunities.</p>
                </div>
                <div className="flex gap-2 w-full max-w-md mt-2">
                  <input 
                    type="text" 
                    id="newCompanyName" 
                    placeholder="Enter your company name..." 
                    className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-3 text-sm outline-none dark:bg-gray-900 focus:ring-2 focus:ring-primary/20 transition-all font-medium" 
                  />
                  <button 
                    type="button" 
                    onClick={async () => {
                      const name = document.getElementById('newCompanyName').value;
                      if (!name) return;
                      try {
                        const newC = await createCompany(localStorage.getItem('token'), name);
                        setCompanies([...companies, newC]);
                        setSelectedCompany(newC);
                        setForm({...form, companyId: newC.companyId});
                      } catch (e) { alert('Error creating company: ' + e.message); }
                    }} 
                    className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
                  >
                    Create Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-50 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                    {selectedCompany?.logoUrl ? <img src={selectedCompany.logoUrl} className="w-full h-full object-contain" /> : <span className="font-bold text-xl text-primary">{selectedCompany?.name?.[0]}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Posting as</p>
                    <h4 className="text-xl font-bold text-[#1D1B18] dark:text-white">{selectedCompany?.name}</h4>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20 uppercase tracking-tighter">Verified Identity</span>
                    {companies.length > 1 && <p className="text-[10px] text-gray-500 font-medium italic">Change in top bar to switch company</p>}
                </div>
              </div>
            )}
          </section>

          {/* Job Details Section */}
          <section className="flex flex-col gap-8 pt-6 border-t border-[#ece7e2] dark:border-gray-700">
            <h3 className="text-xl font-bold text-[#1D1B18] dark:text-white flex items-center gap-2 font-display">
              <span className="material-symbols-outlined text-primary">work_history</span>
              Job Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="flex flex-col gap-2.5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Job Title</span>
                <input 
                  required 
                  type="text" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  className="w-full rounded-2xl text-[#1D1B18] dark:text-white dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 border border-[#ece7e2] dark:border-gray-700 h-14 px-5 text-base font-medium placeholder:text-gray-400 outline-none transition-all" 
                  placeholder="e.g., Senior Frontend Developer"
                />
              </label>

              <label className="flex flex-col gap-2.5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Employment Type</span>
                <div className="relative">
                  <select 
                    value={form.employmentType} 
                    onChange={e => setForm({...form, employmentType: e.target.value})} 
                    className="w-full rounded-2xl text-[#1D1B18] dark:text-white dark:bg-gray-900 focus:ring-4 focus:ring-primary/10 border border-[#ece7e2] dark:border-gray-700 h-14 px-5 text-base font-medium appearance-none outline-none transition-all"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <label className="flex flex-col gap-2.5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Job Location</span>
                <div className="relative">
                  <input 
                    type="text" 
                    value={form.location} 
                    onChange={e => setForm({...form, location: e.target.value})} 
                    className="w-full rounded-2xl text-[#1D1B18] dark:text-white dark:bg-gray-900 border border-[#ece7e2] dark:border-gray-700 h-14 pl-5 pr-12 text-base font-medium placeholder:text-gray-400 focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                    placeholder="e.g., San Francisco, CA" 
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">location_on</span>
                </div>
              </label>

              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Salary Range (USD)</span>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={form.salaryMin} 
                      onChange={e => setForm({...form, salaryMin: e.target.value})} 
                      className="w-full rounded-2xl text-[#1D1B18] dark:text-white dark:bg-gray-900 border border-[#ece7e2] dark:border-gray-700 h-14 px-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  </div>
                  <span className="text-gray-300 font-bold">—</span>
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={form.salaryMax} 
                      onChange={e => setForm({...form, salaryMax: e.target.value})} 
                      className="w-full rounded-2xl text-[#1D1B18] dark:text-white dark:bg-gray-900 border border-[#ece7e2] dark:border-gray-700 h-14 px-5 text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Job Description</span>
              <div className="rounded-3xl border border-[#ece7e2] dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                <div className="flex gap-2 p-3 border-b border-[#ece7e2] dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <button type="button" className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"><span className="material-symbols-outlined text-gray-500 text-xl">format_bold</span></button>
                  <button type="button" className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"><span className="material-symbols-outlined text-gray-500 text-xl">format_italic</span></button>
                  <button type="button" className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"><span className="material-symbols-outlined text-gray-500 text-xl">format_list_bulleted</span></button>
                </div>
                <textarea 
                  rows="8" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  className="w-full p-6 text-[#1D1B18] dark:text-white dark:bg-gray-900 border-none focus:ring-0 text-base leading-relaxed resize-none outline-none font-medium" 
                  placeholder="Enter job requirements, responsibilities, and benefits..."
                ></textarea>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-[#ece7e2] dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => setActiveTab('dashboard')}
              className="px-8 h-14 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
                Cancel
            </button>
            <button 
              type="submit" 
              disabled={companies.length === 0 || isSubmitting} 
              className="px-12 h-14 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all active:scale-95 flex items-center gap-2"
            >
                {isSubmitting ? (
                  <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-xl">rocket_launch</span>
                )}
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
  const [applicants, setApplicants] = useState([]);
  const [filterMode, setFilterMode] = useState('All');
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const [apps, jobs] = await Promise.all([
        getApplicants(token, jobFilter || null),
        getMyJobs(token),
      ]);
      
      // Filter applicants and jobs by selected company if available
      const companyJobs = selectedCompany 
        ? jobs.filter(j => j.company?.companyId === selectedCompany.companyId)
        : jobs;
      
      const jobIdsInCompany = new Set(companyJobs.map(j => j.jobId));
      const filteredApps = selectedCompany 
        ? apps.filter(a => jobIdsInCompany.has(a.jobId))
        : apps;

      setApplicants(filteredApps || []);
      setMyJobs(companyJobs || []);
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

  const filtered = applicants
    .filter(a => filterMode === 'All' || (a.status || 'PENDING').toUpperCase() === filterMode)
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.fullName?.toLowerCase().includes(q) || a.jobTitle?.toLowerCase().includes(q);
    });

  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return ''; } };

  return (
    <div className="flex gap-8 h-full">
      <aside className="w-72 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-white dark:border-gray-800">
          <div className="mb-4">
            <h1 className="text-[#121317] dark:text-white text-lg font-bold">Filter Candidates</h1>
          </div>
          {/* Job filter */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job</p>
            <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm py-2 px-3 outline-none">
              <option value="">All Jobs</option>
              {myJobs.map(j => <option key={j.jobId} value={j.jobId}>{j.title}</option>)}
            </select>
          </div>
          {/* Status filter */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <div onClick={() => setFilterMode('All')} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${filterMode === 'All' ? 'bg-primary text-white shadow-md' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600'}`}>
              <span className="material-symbols-outlined text-[20px]">groups</span>
              <p className="text-sm font-semibold">All</p>
              <span className="ml-auto text-xs opacity-70">{applicants.length}</span>
            </div>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <div key={status} onClick={() => setFilterMode(status)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${filterMode === status ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600'}`}>
                <span className={`material-symbols-outlined text-[20px] ${cfg.color}`}>{cfg.icon}</span>
                <p className="text-sm font-medium capitalize">{status.toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-4 pb-12">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 outline-none border-none rounded-xl shadow-sm text-sm" placeholder="Search by name or job title..." />
        </div>

        <div className="flex flex-col gap-4">
          {filtered.length > 0 ? filtered.map((app, i) => (
            <div key={`${app.id}-${app.jobId}`} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white dark:border-gray-800 hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="flex items-start gap-5">
                <div className="size-14 rounded-xl border border-gray-100 bg-[#dee0ff] text-primary flex items-center justify-center font-bold text-xl overflow-hidden shrink-0">
                  {app.avatarUrl ? <img src={app.avatarUrl} className="w-full h-full object-cover" alt=""/> : app.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#121317] dark:text-white">{app.fullName}</h3>
                      <p className="text-sm text-gray-500">Applied for: <span className="text-primary font-medium">{app.jobTitle}</span></p>
                      {app.currentRole && <p className="text-xs text-gray-400 mt-0.5">{app.currentRole}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <StatusDropdown currentStatus={app.status || 'PENDING'} onChangeStatus={(s) => handleStatusChange(app, s)} />
                      <span className="text-[10px] text-gray-400">{formatDate(app.appliedAt)}</span>
                    </div>
                  </div>
                  {app.coverLetter && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 border border-gray-100 dark:border-gray-700">
                      <span className="font-bold text-gray-500 block mb-1">Cover Letter:</span>{app.coverLetter}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2">
                <button className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">Message</button>
                {app.cvUrl && (
                  <a href={app.cvUrl} target="_blank" rel="noreferrer" className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">description</span>View Uploaded CV
                  </a>
                )}
                {app.cvType === 'profile' && (
                  <a href={`/profile/${app.id}`} target="_blank" rel="noreferrer" className="px-4 py-2 border border-[#dee0ff] bg-[#dee0ff]/20 text-primary text-xs font-bold rounded-lg hover:bg-[#dee0ff]/50 transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">person</span>View Profile CV
                  </a>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white/80 p-10 rounded-2xl border border-white text-center">
              <span className="material-symbols-outlined text-4xl text-[#bac3ff] mb-2 block">person_off</span>
              <p className="font-bold text-gray-500">No applicants found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const MyJobsList = ({ setActiveTab, selectedCompany }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      const token = localStorage.getItem('token');
      if (token) { 
        try { 
          const allJobs = await getMyJobs(token); 
          const filteredJobs = selectedCompany 
            ? allJobs.filter(j => j.company?.companyId === selectedCompany.companyId)
            : allJobs;
          setJobs(filteredJobs);
        } catch (e) { 
          console.error(e); 
        } 
      }
      setLoading(false);
    };
    fetch_();
  }, [selectedCompany]);

  return (
    <div className="animate-[fadeInUp_0.5s_ease-out] max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1d1b18] dark:text-white">My Posted Jobs</h1>
          <p className="text-gray-500 mt-1">Manage your active and past job listings.</p>
        </div>
        <button onClick={() => setActiveTab('post_job')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>Post New Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
      ) : jobs.length === 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 p-16 rounded-2xl border border-white dark:border-gray-700 text-center">
          <span className="material-symbols-outlined text-5xl text-[#bac3ff] mb-4 block">work_off</span>
          <h3 className="font-serif text-xl font-bold mb-2">No jobs posted yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first job listing to start receiving applications.</p>
          <button onClick={() => setActiveTab('post_job')} className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm">Post Your First Job</button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <div key={job.jobId} className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white dark:border-gray-800 hover:shadow-xl hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#dee0ff] flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-lg">{job.company?.name?.[0] || 'C'}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#121317] dark:text-white">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company?.name} • {job.location || 'Remote'}</p>
                    <div className="flex gap-2 mt-2">
                      {job.employmentType && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{job.employmentType}</span>}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{job.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{job.applicantCount}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Applicants</p>
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
