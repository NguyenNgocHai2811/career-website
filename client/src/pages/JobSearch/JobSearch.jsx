import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getJobs, getRecommendedJobs, getJobById, applyToJob, saveJob, unsaveJob } from '../../services/jobService';
import AppHeader from '../../components/AppHeader/AppHeader';

// ============================
// APPLY MODAL COMPONENT
// ============================
const ApplyModal = ({ job, onClose, onApplied }) => {
  const [cvType, setCvType] = useState('profile'); // 'profile' | 'file'
  const [cvFile, setCvFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Bạn cần đăng nhập để nộp đơn.');
      return;
    }
    if (cvType === 'file' && !cvFile) {
      setError('Vui lòng chọn file CV để tải lên.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await applyToJob({
        jobId: job.jobId,
        cvType,
        cvFile,
        token,
        coverLetter,
      });
      setSuccess(result.message || 'Nộp đơn thành công!');
      setTimeout(() => {
        onApplied?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
           style={{ animation: 'fadeInUp 0.3s ease-out' }}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-[#ece7e2] px-6 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-[#1d1b18]">Nộp đơn ứng tuyển</h3>
            <p className="text-xs text-[#454652] mt-0.5">{job.title} — {job.company?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-[#f2ede7] flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#757684]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* CV Type Selection */}
          <div>
            <label className="text-xs font-bold text-[#4153b4] uppercase tracking-wider block mb-3">Chọn cách nộp CV</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option: Use Profile */}
              <button
                type="button"
                onClick={() => setCvType('profile')}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  cvType === 'profile'
                    ? 'border-[#4153b4] bg-[#4153b4]/5 shadow-md shadow-[#4153b4]/10'
                    : 'border-[#ece7e2] hover:border-[#bac3ff] bg-white'
                }`}
              >
                {cvType === 'profile' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4153b4] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-[#dee0ff] flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4153b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-[#1d1b18]">Dùng Profile</h4>
                <p className="text-[0.7rem] text-[#454652] mt-1 leading-snug">Trang hồ sơ cá nhân của bạn sẽ được sử dụng làm CV</p>
              </button>

              {/* Option: Upload File */}
              <button
                type="button"
                onClick={() => setCvType('file')}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  cvType === 'file'
                    ? 'border-[#4153b4] bg-[#4153b4]/5 shadow-md shadow-[#4153b4]/10'
                    : 'border-[#ece7e2] hover:border-[#bac3ff] bg-white'
                }`}
              >
                {cvType === 'file' && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4153b4] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="w-10 h-10 rounded-xl bg-[#f4d9ff] flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7c429f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-[#1d1b18]">Tải lên CV</h4>
                <p className="text-[0.7rem] text-[#454652] mt-1 leading-snug">Tải file PDF (tối đa 10MB)</p>
              </button>
            </div>
          </div>

          {/* File Upload Area (shown only when cvType === 'file') */}
          {cvType === 'file' && (
            <div>
              <label className="text-xs font-bold text-[#4153b4] uppercase tracking-wider block mb-2">Chọn file CV</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#bac3ff] rounded-2xl cursor-pointer bg-[#fef9f3] hover:bg-[#f8f3ed] transition-colors">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => setCvFile(e.target.files[0])}
                />
                {cvFile ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#dee0ff] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4153b4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1d1b18]">{cvFile.name}</p>
                      <p className="text-xs text-[#454652]">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#bac3ff] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-[#454652]">Kéo thả hoặc <span className="text-[#4153b4] font-bold">chọn file</span></p>
                    <p className="text-[0.65rem] text-[#757684] mt-1">PDF — tối đa 10MB</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {/* Cover Letter */}
          <div>
            <label className="text-xs font-bold text-[#4153b4] uppercase tracking-wider block mb-2">Thư giới thiệu (không bắt buộc)</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Viết vài dòng giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#ece7e2] bg-[#fef9f3] text-sm text-[#1d1b18] resize-none focus:ring-2 focus:ring-[#4153b4]/20 focus:border-[#4153b4] outline-none transition-all placeholder:text-[#757684]"
            />
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3.5 bg-[#4153b4] text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 hover:bg-[#293d9d] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#4153b4]/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Đang nộp đơn...
              </>
            ) : success ? (
              'Đã nộp thành công ✓'
            ) : (
              'Nộp đơn ứng tuyển'
            )}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

// ============================
// JOB CARD COMPONENT
// ============================
const timeAgo = (dateVal) => {
  if (!dateVal) return '';
  // Neo4j integers are serialized as { low, high } — unwrap if needed
  const n = (v) => (v && typeof v === 'object' && 'low' in v ? v.low : v);
  let date;
  if (typeof dateVal === 'string') {
    date = new Date(dateVal);
  } else if (typeof dateVal === 'object' && dateVal.year !== undefined) {
    const y = n(dateVal.year);
    const mo = String(n(dateVal.month)).padStart(2, '0');
    const d = String(n(dateVal.day)).padStart(2, '0');
    const h = String(n(dateVal.hour) || 0).padStart(2, '0');
    const mi = String(n(dateVal.minute) || 0).padStart(2, '0');
    const s = String(n(dateVal.second) || 0).padStart(2, '0');
    date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
  } else {
    return '';
  }
  if (isNaN(date)) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)} tháng trước`;
  return `${Math.floor(diff / 31536000)} năm trước`;
};

const JobCard = ({ job, onClick }) => {
  // Deterministic random image index based on jobId string
  const imgIdx = job.jobId ? job.jobId.charCodeAt(job.jobId.length - 1) % 5 : 0;
  const bannerImg = `https://images.unsplash.com/photo-${[
    '1497215728101-856f4ea42174', 
    '1522071823991-b51c1707eadb', 
    '1552664730-d307ca884978',
    '1517245386807-bb43f82c33c4',
    '1556761175-b413da4baf72'
  ][imgIdx]}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;

  return (
    <div 
      onClick={() => onClick(job)}
      className="card-reveal group relative bg-white rounded-3xl overflow-hidden border border-[#ece7e2] shadow-sm card-hover-effect cursor-pointer flex flex-col transition-all duration-300"
    >
      {/* Banner Image */}
      <div className="h-32 bg-cover bg-center relative" style={{ backgroundImage: `url("${bannerImg}")` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-40"></div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg px-2 py-1 text-[0.6rem] font-bold text-[#1d1b18] uppercase tracking-wider">
          {job.employmentType}
        </div>
        {job.matchScore !== undefined && (
          <div className="absolute top-3 left-3 bg-[#4153b4] text-white rounded-lg px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider">
            {job.matchScore}% match
          </div>
        )}
      </div>

      <div className="p-6 pt-10 relative flex-1 flex flex-col">
        {/* Floating Logo */}
        <div className="absolute -top-8 left-6 size-16 rounded-2xl bg-white shadow-md p-1 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-50">
          <div className="size-full rounded-xl bg-[#fef9f3] flex items-center justify-center overflow-hidden">
            {job.company?.logoUrl ? (
              <img src={job.company.logoUrl} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[#4153b4] font-bold text-lg">{job.company?.name?.[0]}</span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-lg text-[#1d1b18] group-hover:text-[#4153b4] transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-xs text-[#454652] mt-1">
            <Link 
              to={`/company/${job.company?.companyId}`} 
              onClick={(e) => e.stopPropagation()}
              className="hover:text-[#4153b4] transition-colors font-medium"
            >
              {job.company?.name}
            </Link>
            &nbsp;• {job.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-2 py-1 bg-[#4153b4]/5 text-[#4153b4] rounded-lg text-[0.6rem] font-bold uppercase tracking-wider">
            {job.level}
          </span>
          <span className="px-2 py-1 bg-[#4153b4]/5 text-[#4153b4] rounded-lg text-[0.6rem] font-bold uppercase tracking-wider">
            {job.category}
          </span>
        </div>

        {job.recommendationReasons?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {job.recommendationReasons.slice(0, 2).map(reason => (
              <span key={reason} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[0.6rem] font-bold uppercase tracking-wider">
                {reason}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
          <span className="text-[#1d1b18] font-bold text-sm">
            {job.salaryMin ? `$${job.salaryMin/1000}k` : 'Negotiable'}
            {job.salaryMin && job.salaryMax ? ` - $${job.salaryMax/1000}k` : ''}
          </span>
          <span className="text-[#a0aec0] text-[0.6rem] font-bold uppercase tracking-widest">{timeAgo(job.postedAt)}</span>
        </div>
      </div>
    </div>
  );
};

// ============================
// JOB SEARCH PAGE COMPONENT
// ============================
const JobSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);
  const [page, setPage] = useState(1);
  const [jobMode, setJobMode] = useState('all');
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [recommendationError, setRecommendationError] = useState('');
  const JOBS_PER_PAGE = 12;

  // Search & Filter States
  const [keyword, setKeyword] = useState(searchParams.get('title') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  // Advanced Filter States
  const [category, setCategory] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [selectedExperience, setSelectedExperience] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [dateRange, setDateRange] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || null;
  const canApply = userRole === 'CANDIDATE';
  const isRecommendedMode = jobMode === 'recommended';

  // Sync URL params with state
  useEffect(() => {
    const title = searchParams.get('title');
    const loc = searchParams.get('location');
    if (title !== null) setKeyword(title);
    if (loc !== null) setLocation(loc);
  }, [searchParams]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setRecommendationError('');
    try {
      let data = [];

      if (isRecommendedMode) {
        const token = localStorage.getItem('token');
        if (!token || !canApply) {
          setRecommendationMeta(null);
          setJobs([]);
          setPage(1);
          return;
        }

        const result = await getRecommendedJobs(token, { limit: 60 });
        data = result.data || [];
        setRecommendationMeta(result.meta || null);
      } else {
        const filters = {};
        if (keyword) filters.title = keyword;
        if (location) filters.location = location;
        if (selectedTypes.length > 0) filters.employmentType = selectedTypes.join(',');
        
        // Advanced Filters
        if (category) filters.category = category;
        if (salaryRange) filters.salaryRange = salaryRange;
        if (selectedExperience.length > 0) filters.experience = selectedExperience.join(',');
        if (selectedLevels.length > 0) filters.level = selectedLevels.join(',');
        if (dateRange) filters.dateRange = dateRange;

        data = await getJobs(filters);
        setRecommendationMeta(null);
      }

      setJobs(data || []);
      setPage(1);

      // Auto-select job if jobId is in URL
      const urlJobId = searchParams.get('jobId');
      if (urlJobId && data) {
        const found = data.find(j => j.jobId === urlJobId);
        if (found) setSelectedJob(found);
      }
    } catch (error) {
      console.error(error);
      if (isRecommendedMode) {
        setRecommendationError(error.message || 'Failed to load recommendations');
      }
    } finally {
      setLoading(false);
    }
  }, [isRecommendedMode, canApply, keyword, location, selectedTypes, category, salaryRange, selectedExperience, selectedLevels, dateRange, searchParams]);

  useEffect(() => {
    fetchJobs();
    // We refetch when any sidebar filter or search keyword changes
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleArrayItem = (setter) => (item) => {
    setter(prev => prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]);
  };
  
  const toggleType = toggleArrayItem(setSelectedTypes);
  const toggleExp = toggleArrayItem(setSelectedExperience);
  const toggleLevel = toggleArrayItem(setSelectedLevels);

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedTypes([]);
    setCategory('');
    setSalaryRange('');
    setSelectedExperience([]);
    setSelectedLevels([]);
    setDateRange('');
  };

  const handleApplyClick = (e) => {
    e?.stopPropagation?.();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để nộp đơn ứng tuyển.');
      navigate('/login');
      return;
    }
    if (!canApply) {
      alert('Chỉ tài khoản ứng viên mới có thể nộp đơn ứng tuyển.');
      return;
    }
    setShowApplyModal(true);
  };

  const handleSaveToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để lưu công việc.');
      navigate('/login');
      return;
    }
    if (!selectedJob || savingJobId === selectedJob.jobId) return;
    const jobId = selectedJob.jobId;
    const alreadySaved = savedJobIds.has(jobId);
    setSavingJobId(jobId);
    try {
      if (alreadySaved) {
        await unsaveJob(jobId, token);
        setSavedJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      } else {
        await saveJob(jobId, token);
        setSavedJobIds(prev => new Set([...prev, jobId]));
      }
    } catch (err) {
      console.error('Save toggle error:', err);
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF9F3] selection:bg-[#4153b4]/20" style={{
      backgroundImage: `radial-gradient(circle at 10% 20%, rgba(207, 229, 255, 0.4) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(244, 217, 255, 0.4) 0%, transparent 40%),
                        radial-gradient(circle at 50% 50%, rgba(222, 224, 255, 0.3) 0%, transparent 60%)`
    }}>
      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <ApplyModal 
          job={selectedJob} 
          onClose={() => setShowApplyModal(false)}
          onApplied={() => {
            // Refresh the selected job to update hasApplied state
            setSelectedJob(prev => prev ? { ...prev, hasApplied: true } : null);
          }}
        />
      )}

      {/* Shared App Header */}
      <AppHeader activeTab="jobs" />

      <main className="max-w-screen-2xl mx-auto px-8 py-12">
        {/* Split View or Grid View */}
        {selectedJob ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left List (Split View) */}
            <div className="lg:w-1/3 flex flex-col gap-4 overflow-y-auto max-h-[80vh] pr-4 hide-scrollbar">
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-sm font-bold text-[#4153b4] mb-2 hover:underline text-left block"
              >
                &larr; Quay lại danh sách
              </button>
              {jobs.map(job => (
                <div 
                  key={job.jobId} 
                  onClick={async () => {
                    setSelectedJob(job);
                    const token = localStorage.getItem('token');
                    if (token) {
                      try {
                        const detail = await getJobById(job.jobId);
                        setSelectedJob(detail);
                        if (detail.isSaved) {
                          setSavedJobIds(prev => new Set([...prev, detail.jobId]));
                        }
                      } catch (error) {
                        console.error('Failed to load job detail:', error);
                      }
                    }
                  }}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all duration-300 flex items-center gap-4 ${selectedJob.jobId === job.jobId ? 'border-[#4153b4] bg-white shadow-md scale-[1.02] z-10' : 'border-transparent bg-white/50 hover:bg-white hover:border-[#ece7e2]'}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedJob.jobId === job.jobId ? 'bg-[#4153b4]/10' : 'bg-white shadow-sm'}`}>
                    {job.company?.logoUrl ? (
                      <img src={job.company.logoUrl} alt="" className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-[#4153b4] font-bold text-base">{job.company?.name?.[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-bold text-sm truncate transition-colors ${selectedJob.jobId === job.jobId ? 'text-[#4153b4]' : 'text-[#1d1b18]'}`}>{job.title}</h4>
                    <p className="text-[0.7rem] text-[#454652] truncate mt-0.5">{job.company?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[0.6rem] font-bold text-[#a0aec0] uppercase tracking-tighter">{job.employmentType}</span>
                      <span className="text-[0.6rem] text-[#a0aec0]">•</span>
                      <span className="text-[0.6rem] font-bold text-[#a0aec0] uppercase tracking-tighter">{job.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Detail Pane */}
            <div className="lg:w-2/3 bg-white rounded-3xl p-10 shadow-lg border border-[#ece7e2]" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-[#fef9f3] rounded-2xl flex items-center justify-center p-3 flex-shrink-0">
                    {selectedJob.company?.logoUrl ? (
                        <img src={selectedJob.company.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-[#4153b4] font-bold text-3xl">{selectedJob.company?.name?.[0] || 'C'}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-[#1d1b18] leading-snug">{selectedJob.title}</h1>
                  <p className="text-[#454652] mt-1">
                    <Link 
                      to={`/company/${selectedJob.company?.companyId}`}
                      className="font-bold text-[#4153b4] hover:underline"
                    >
                      {selectedJob.company?.name}
                    </Link>
                    &nbsp;&bull; {selectedJob.location || 'Remote'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedJob.employmentType && (
                      <span className="px-3 py-1 bg-[#dee0ff] rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-[#293d9d]">
                        {selectedJob.employmentType}
                      </span>
                    )}
                    {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                      <span className="px-3 py-1 bg-[#f2ede7] rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-[#335b80]">
                        {selectedJob.salaryMin ? `$${selectedJob.salaryMin/1000}k` : ''}
                        {selectedJob.salaryMin && selectedJob.salaryMax ? ' - ' : ''}
                        {selectedJob.salaryMax ? `$${selectedJob.salaryMax/1000}k` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mb-8 border-b border-[#ece7e2] pb-8">
                {selectedJob.hasApplied ? (
                  <button 
                    disabled
                    className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold text-sm tracking-wider cursor-default flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Đã nộp đơn
                  </button>
                ) : canApply ? (
                  <button 
                    onClick={handleApplyClick}
                    className="px-6 py-3 bg-[#4153b4] text-white rounded-full font-bold text-sm tracking-wider hover:bg-[#293d9d] transition-colors shadow-lg shadow-[#4153b4]/20"
                  >
                    Nộp đơn ứng tuyển
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-[#ece7e2] text-[#757684] rounded-full font-bold text-sm tracking-wider cursor-not-allowed"
                  >
                    Chỉ dành cho ứng viên
                  </button>
                )}
                <button
                  onClick={handleSaveToggle}
                  disabled={savingJobId === selectedJob.jobId}
                  className={`px-6 py-3 rounded-full font-bold text-sm tracking-wider transition-colors flex items-center gap-2 ${
                    savedJobIds.has(selectedJob.jobId)
                      ? 'bg-[#4153b4] text-white hover:bg-[#293d9d]'
                      : 'bg-[#f8f3ed] text-[#4153b4] hover:bg-[#ece7e2]'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={savedJobIds.has(selectedJob.jobId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedJobIds.has(selectedJob.jobId) ? 'Đã lưu' : 'Lưu lại'}
                </button>
              </div>

              {selectedJob.recommendationReasons?.length > 0 && (
                <div className="mb-8 rounded-2xl border border-[#dee0ff] bg-[#f8f3ed] p-5">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-[#1d1b18]">Why this matches</h3>
                    {selectedJob.matchScore !== undefined && (
                      <span className="rounded-full bg-[#4153b4] px-3 py-1 text-xs font-bold text-white">
                        {selectedJob.matchScore}% match
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.recommendationReasons.map(reason => (
                      <span key={reason} className="px-3 py-1.5 bg-white text-[#4153b4] rounded-lg text-xs font-bold">
                        {reason}
                      </span>
                    ))}
                  </div>
                  {selectedJob.matchedSkills?.length > 0 && (
                    <p className="mt-3 text-xs text-[#454652]">
                      Matched skills: {selectedJob.matchedSkills.join(', ')}
                    </p>
                  )}
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-4 text-[#1d1b18]">Mô tả công việc</h3>
              <p className="text-[#454652] leading-relaxed mb-6 whitespace-pre-line">{selectedJob.description || 'Chưa có mô tả chi tiết cho vị trí này.'}</p>
              
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <>
                  <h3 className="text-xl font-bold mb-4 mt-8 text-[#1d1b18]">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map(s => (
                      <span key={s.name} className="px-3 py-1.5 bg-[#f4d9ff] text-[#642b88] rounded-lg text-sm font-semibold">
                        {s.name}
                        {s.weight && <span className="ml-1 text-[0.6rem] opacity-60">({s.weight === 5 ? 'Bắt buộc' : 'Ưu tiên'})</span>}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Default Grid View */
          <>
            <section className="mb-12">
              <h1 className="text-5xl font-bold text-[#1d1b18] mb-4 leading-tight">
                Khám phá cơ hội<br/><span className="text-[#4153b4] italic font-light">nghề nghiệp</span> mới.
              </h1>
              <p className="text-[#454652] max-w-xl text-lg mb-10">
                Tìm kiếm các vị trí tuyển dụng phù hợp với kỹ năng và đam mê của bạn.
              </p>

              {/* Advanced Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-4xl bg-white rounded-3xl p-3 shadow-xl shadow-[#4153b4]/10 border border-[#ece7e2] flex flex-col md:flex-row items-center gap-3">
                <div className="flex-1 w-full flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-[#ece7e2]">
                  <span className="material-symbols-outlined text-[#4153b4]">search</span>
                  <input 
                    type="text" 
                    placeholder="Tên công việc, từ khóa..." 
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#1d1b18] placeholder:text-[#757684] text-sm"
                  />
                </div>
                <div className="flex-1 w-full flex items-center gap-3 px-4 py-2">
                  <span className="material-symbols-outlined text-[#4153b4]">location_on</span>
                  <input 
                    type="text" 
                    placeholder="Địa điểm (Thành phố, Quốc gia...)" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#1d1b18] placeholder:text-[#757684] text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-[#4153b4] text-white rounded-2xl font-bold text-sm hover:bg-[#293d9d] transition-all shadow-lg shadow-[#4153b4]/20"
                >
                  Tìm kiếm
                </button>
              </form>
              {canApply && (
                <div className="mt-6 inline-flex rounded-2xl border border-[#ece7e2] bg-white p-1 shadow-sm">
                  {[
                    { value: 'all', label: 'Tat ca viec lam' },
                    { value: 'recommended', label: 'Goi y cho ban' },
                  ].map(mode => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => {
                        setSelectedJob(null);
                        setJobMode(mode.value);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        jobMode === mode.value
                          ? 'bg-[#4153b4] text-white shadow-md shadow-[#4153b4]/20'
                          : 'text-[#454652] hover:text-[#4153b4] hover:bg-[#f8f3ed]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              )}
            </section>
            
            <div className="flex flex-col lg:flex-row gap-12">
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-2 h-[80vh] overflow-y-auto hide-scrollbar pr-4 pb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#1d1b18] text-lg">Lọc tìm kiếm</h3>
                    <button onClick={clearFilters} className="text-xs font-bold text-[#4153b4] hover:underline">Xóa tất cả</button>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Ngành nghề</span>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#ece7e2] text-sm text-[#454652] focus:ring-[#4153b4] focus:border-[#4153b4] bg-white outline-none cursor-pointer"
                    >
                      <option value="">Tất cả ngành nghề</option>
                      {['IT', 'Kế toán', 'Bán hàng', 'Marketing', 'Nhân sự', 'Sản xuất', 'Thiết kế'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Posting Date */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Ngày đăng</span>
                    <div className="space-y-1">
                      {[
                        { label: 'Mọi lúc', value: '' },
                        { label: '24 giờ qua', value: '24h' },
                        { label: '3 ngày qua', value: '3d' },
                        { label: '7 ngày qua', value: '7d' },
                      ].map(dr => (
                        <label key={dr.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f8f3ed] cursor-pointer group">
                          <input 
                            type="radio" 
                            name="dateRange"
                            value={dr.value}
                            checked={dateRange === dr.value}
                            onChange={() => setDateRange(dr.value)}
                            className="text-[#4153b4] focus:ring-[#4153b4]"
                          />
                          <span className={`text-sm ${dateRange === dr.value ? 'text-[#4153b4] font-bold' : 'text-[#454652] group-hover:text-[#4153b4]'}`}>{dr.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Mức lương</span>
                    <div className="space-y-1">
                      {[
                        { label: 'Tất cả mức lương', value: '' },
                        { label: 'Dưới 5 triệu', value: '<5' },
                        { label: '5 - 10 triệu', value: '5-10' },
                        { label: '10 - 15 triệu', value: '10-15' },
                        { label: '15 - 20 triệu', value: '15-20' },
                        { label: 'Trên 20 triệu', value: '>20' },
                        { label: 'Thỏa thuận', value: 'negotiable' },
                      ].map(sal => (
                        <label key={sal.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#f8f3ed] cursor-pointer group">
                          <input 
                            type="radio" 
                            name="salaryRange"
                            value={sal.value}
                            checked={salaryRange === sal.value}
                            onChange={() => setSalaryRange(sal.value)}
                            className="text-[#4153b4] focus:ring-[#4153b4]"
                          />
                          <span className={`text-sm ${salaryRange === sal.value ? 'text-[#4153b4] font-bold' : 'text-[#454652] group-hover:text-[#4153b4]'}`}>{sal.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Kinh nghiệm</span>
                    <div className="space-y-1">
                      {['Không yêu cầu', 'Dưới 1 năm', '1-3 năm', '3-5 năm', 'Trên 5 năm'].map(exp => (
                        <label key={exp} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f3ed] cursor-pointer group">
                          <span className={`text-sm ${selectedExperience.includes(exp) ? 'text-[#4153b4] font-bold' : 'text-[#454652] group-hover:text-[#4153b4]'}`}>{exp}</span>
                          <input 
                            type="checkbox" 
                            checked={selectedExperience.includes(exp)}
                            onChange={() => toggleExp(exp)}
                            className="rounded border-gray-300 text-[#4153b4] focus:ring-[#4153b4]" 
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Level */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Cấp bậc</span>
                    <div className="space-y-1">
                      {['Thực tập sinh', 'Nhân viên', 'Trưởng nhóm', 'Quản lý', 'Giám đốc'].map(lvl => (
                        <label key={lvl} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f3ed] cursor-pointer group">
                          <span className={`text-sm ${selectedLevels.includes(lvl) ? 'text-[#4153b4] font-bold' : 'text-[#454652] group-hover:text-[#4153b4]'}`}>{lvl}</span>
                          <input 
                            type="checkbox" 
                            checked={selectedLevels.includes(lvl)}
                            onChange={() => toggleLevel(lvl)}
                            className="rounded border-gray-300 text-[#4153b4] focus:ring-[#4153b4]" 
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Employment Type */}
                  <div className="mb-6">
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-3 block">Hình thức làm việc</span>
                    <div className="space-y-1">
                      {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map(type => (
                        <label key={type} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f3ed] cursor-pointer group">
                          <span className={`text-sm ${selectedTypes.includes(type) ? 'text-[#4153b4] font-bold' : 'text-[#454652] group-hover:text-[#4153b4]'}`}>{type}</span>
                          <input 
                            type="checkbox" 
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="rounded border-gray-300 text-[#4153b4] focus:ring-[#4153b4]" 
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Talent Pool CTA */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#4153b4]/10 to-[#7c429f]/10 border-l-4 border-[#4153b4]">
                    <h4 className="text-[#4153b4] font-bold mb-2">Talent Pool</h4>
                    <p className="text-xs text-[#454652] leading-relaxed">Tham gia nhóm tài năng để được nhà tuyển dụng liên hệ trước.</p>
                    <button className="mt-4 text-xs font-bold text-[#4153b4] uppercase tracking-widest border-b-2 border-[#4153b4]/20 hover:border-[#4153b4] transition-all">Tham gia</button>
                  </div>
                </div>
              </aside>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm text-[#454652]">
                    {loading ? 'Đang tìm kiếm...' : (
                      isRecommendedMode ? (
                        <>Goi y <span className="font-bold text-[#1d1b18]">{jobs.length}</span> viec lam theo skills va location cua ban</>
                      ) : (
                        <>Tìm thấy <span className="font-bold text-[#1d1b18]">{jobs.length}</span> vị trí phù hợp</>
                      )
                    )}
                  </span>
                  {isRecommendedMode && recommendationMeta?.candidateSkillCount > 0 && (
                    <span className="text-xs font-bold text-[#4153b4] bg-[#dee0ff] px-3 py-1.5 rounded-full">
                      {recommendationMeta.candidateSkillCount} profile skills
                    </span>
                  )}
                </div>
                {isRecommendedMode && recommendationError && (
                  <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {recommendationError}
                  </div>
                )}
                
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#4153b4]/20"></div>
                          <div className="w-2 h-2 rounded-full bg-[#4153b4]/40 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-[#4153b4] animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-[#4153b4]/40 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-[#4153b4]/20"></div>
                        </div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#bac3ff]">
                      <div className="w-20 h-20 rounded-full bg-[#f2ede7] flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-[#bac3ff] text-5xl">search_off</span>
                      </div>
                      {isRecommendedMode ? (
                        <>
                          <h3 className="text-xl font-bold text-[#1d1b18] mb-2">Chua co goi y phu hop</h3>
                          <p className="text-sm text-[#454652]">Them skills va location vao profile de Neo4j co du lieu goi y tot hon.</p>
                          <Link to="/profile" className="mt-6 inline-block text-sm font-bold text-[#4153b4] hover:underline">
                            Cap nhat profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold text-[#1d1b18] mb-2">Không tìm thấy công việc phù hợp</h3>
                          <p className="text-sm text-[#454652]">Thử thay đổi từ khóa hoặc bộ lọc để có kết quả tốt hơn.</p>
                          <button onClick={clearFilters} className="mt-6 text-sm font-bold text-[#4153b4] hover:underline">
                            Xóa tất cả bộ lọc
                          </button>
                        </>
                      )}
                    </div>
                ) : (() => {
                    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
                    const paginatedJobs = jobs.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {paginatedJobs.map(job => (
                            <JobCard key={job.jobId} job={job} onClick={setSelectedJob} />
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              disabled={page === 1}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#ece7e2] bg-white text-[#454652] hover:border-[#4153b4] hover:text-[#4153b4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                              if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                                if (p === 2 || p === totalPages - 1) return <span key={p} className="w-10 h-10 flex items-center justify-center text-[#a0aec0] text-sm">···</span>;
                                return null;
                              }
                              return (
                                <button
                                  key={p}
                                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                    p === page
                                      ? 'bg-[#4153b4] text-white shadow-lg shadow-[#4153b4]/20'
                                      : 'border border-[#ece7e2] bg-white text-[#454652] hover:border-[#4153b4] hover:text-[#4153b4]'
                                  }`}
                                >
                                  {p}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              disabled={page === totalPages}
                              className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#ece7e2] bg-white text-[#454652] hover:border-[#4153b4] hover:text-[#4153b4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </>
                    );
                })()}
              </div>
            </div>
          </>
        )}
      </main>
      

      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default JobSearch;
