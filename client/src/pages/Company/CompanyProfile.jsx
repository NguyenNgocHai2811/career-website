import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompanyDetails } from '../../services/companyService';
import AppHeader from '../../components/AppHeader/AppHeader';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // about, jobs, people

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await getCompanyDetails(token, companyId);
        setCompany(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [companyId]);

  if (loading) return <div className="p-10 text-center font-bold">Đang tải thông tin công ty...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!company) return <div className="p-10 text-center font-bold">Không tìm thấy công ty</div>;

  return (
    <div className="bg-[#FEF9F3] min-h-screen text-[#1D1B18] font-sans pb-20">
      <AppHeader />
      <div className="max-w-[1200px] mx-auto pt-20 px-4 md:px-8">
        
        {/* Full Header Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#ece7e2] overflow-hidden mb-8">
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 relative">
             {/* Note: if company has bannerUrl we would use it here */}
          </div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-lg border border-gray-100 relative z-10 shrink-0">
                <div className="w-full h-full rounded-xl bg-[#dee0ff] text-primary flex items-center justify-center font-bold text-4xl overflow-hidden">
                  {company.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-cover" /> : company.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black font-serif">{company.name}</h1>
                <p className="text-gray-500 text-sm mt-1">{company.industry || 'Technology'} • {company.location || 'Remote'} • {company.employees?.length || 0} employees</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined align-middle mr-1 text-sm">open_in_new</span>
                  Website
                </button>
                <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                  + Follow
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-100 mt-8">
              <button onClick={() => setActiveTab('about')} className={`pb-3 text-sm font-bold transition-all ${activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-[#1D1B18]'}`}>
                About
              </button>
              <button onClick={() => setActiveTab('jobs')} className={`pb-3 text-sm font-bold transition-all ${activeTab === 'jobs' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-[#1D1B18]'}`}>
                Jobs <span className="ml-1 bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full text-[10px]">{company.jobs?.length || 0}</span>
              </button>
              <button onClick={() => setActiveTab('people')} className={`pb-3 text-sm font-bold transition-all ${activeTab === 'people' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-[#1D1B18]'}`}>
                People <span className="ml-1 bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full text-[10px]">{company.employees?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            {activeTab === 'about' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#ece7e2] animate-[fadeInUp_0.5s_ease-out]">
                <h3 className="text-xl font-bold font-serif mb-4">About the Company</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {company.description || 'Welcome to our company profile! We are dedicated to building great products and providing an excellent environment for our team members.'}
                </p>
              </div>
            )}
            
            {activeTab === 'jobs' && (
              <div className="flex flex-col gap-4 animate-[fadeInUp_0.5s_ease-out]">
                {company.jobs && company.jobs.length > 0 ? company.jobs.map(job => (
                  <div key={job.id} onClick={() => navigate(`/jobs`)} className="bg-white p-6 rounded-2xl shadow-sm border border-[#ece7e2] hover:shadow-lg transition-all cursor-pointer group">
                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{job.employmentType} • {job.location}</p>
                    <div className="mt-4 flex gap-2">
                       <span className="text-[10px] font-bold bg-[#F8F3ED] px-2 py-1 rounded text-gray-600">{job.salaryMin} - {job.salaryMax} USD</span>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white p-10 rounded-2xl shadow-sm border border-[#ece7e2] text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">work_off</span>
                    <p className="font-bold text-gray-500">No active jobs posted at the moment.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'people' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeInUp_0.5s_ease-out]">
                {company.employees && company.employees.length > 0 ? company.employees.map(user => (
                   <div key={user.id} onClick={() => navigate(`/profile/${user.id}`)} className="bg-white p-4 rounded-2xl shadow-sm border border-[#ece7e2] flex items-center gap-4 hover:shadow-md cursor-pointer transition-all">
                     <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-50">
                       {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{user.fullName?.charAt(0)}</div>}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-sm truncate">{user.fullName}</p>
                       <p className="text-xs text-gray-500 truncate">{user.headline || user.role}</p>
                     </div>
                   </div>
                )) : (
                  <div className="col-span-1 sm:col-span-2 bg-white p-10 rounded-2xl shadow-sm border border-[#ece7e2] text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">groups</span>
                    <p className="font-bold text-gray-500">No employees linked to this company yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="col-span-1 space-y-6">
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece7e2]">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Location</h3>
                <div className="aspect-video bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-400">map</span>
                </div>
                <p className="text-sm font-medium">{company.location || 'Headquarters'}</p>
             </div>
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece7e2]">
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-4">Size</h3>
                <p className="text-sm font-medium flex items-center gap-2">
                   <span className="material-symbols-outlined text-gray-400">domain</span>
                   {company.employees?.length || 0} members
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyProfile;
