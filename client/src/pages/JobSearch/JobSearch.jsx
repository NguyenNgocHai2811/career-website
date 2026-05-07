import React, { useEffect, useState } from 'react';
import { getJobs, applyToJob } from '../../services/jobService';
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
                <p className="text-[0.7rem] text-[#454652] mt-1 leading-snug">Tải file PDF, DOC hoặc DOCX (tối đa 10MB)</p>
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
                  accept=".pdf,.doc,.docx"
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
                    <p className="text-[0.65rem] text-[#757684] mt-1">PDF, DOC, DOCX — tối đa 10MB</p>
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
const JobCard = ({ job, onClick }) => {
  return (
    <div 
      onClick={() => onClick(job)}
      className="group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#4153b4]/5 cursor-pointer flex flex-col justify-between h-[280px]"
    >
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 bg-[#fef9f3] rounded-xl flex items-center justify-center p-2">
          {job.company?.logoUrl ? (
            <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-[#4153b4] font-bold text-xl">{job.company?.name?.[0] || 'C'}</span>
          )}
        </div>
        <button 
          className="text-[#757684] hover:text-[#7c429f] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
           </svg>
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-xl text-[#1d1b18] group-hover:text-[#4153b4] transition-colors line-clamp-2">
          {job.title}
        </h3>
        <p className="text-sm text-[#454652] mt-1">{job.company?.name || 'Unknown Company'}</p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {job.location && (
          <span className="px-3 py-1 bg-[#f2ede7] rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-[#335b80]">
            {job.location}
          </span>
        )}
        {(job.salaryMin || job.salaryMax) && (
          <span className="px-3 py-1 bg-[#f2ede7] rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-[#335b80]">
            {job.salaryMin ? `$${job.salaryMin/1000}k` : ''} 
            {job.salaryMin && job.salaryMax ? ' - ' : ''} 
            {job.salaryMax ? `$${job.salaryMax/1000}k` : ''}
          </span>
        )}
        {job.employmentType && (
          <span className="px-3 py-1 bg-[#4153b4]/10 rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-[#4153b4]">
            {job.employmentType}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================
// JOB SEARCH PAGE COMPONENT
// ============================
const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApplyClick = (e) => {
    e?.stopPropagation?.();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập trước khi nộp đơn ứng tuyển.');
      return;
    }
    setShowApplyModal(true);
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
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${selectedJob.jobId === job.jobId ? 'border-[#4153b4] bg-[#f8f3ed] shadow-sm' : 'border-transparent bg-white hover:border-[#ece7e2]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#fef9f3] flex items-center justify-center flex-shrink-0">
                      {job.company?.logoUrl ? (
                        <img src={job.company.logoUrl} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <span className="text-[#4153b4] font-bold text-sm">{job.company?.name?.[0] || 'C'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[#1d1b18] text-sm truncate">{job.title}</h4>
                      <p className="text-xs text-[#454652] truncate">{job.company?.name}</p>
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
                  <p className="text-[#454652] mt-1">{selectedJob.company?.name} &bull; {selectedJob.location || 'Remote'}</p>
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
                ) : (
                  <button 
                    onClick={handleApplyClick}
                    className="px-6 py-3 bg-[#4153b4] text-white rounded-full font-bold text-sm tracking-wider hover:bg-[#293d9d] transition-colors shadow-lg shadow-[#4153b4]/20"
                  >
                    Nộp đơn ứng tuyển
                  </button>
                )}
                <button className="px-6 py-3 bg-[#f8f3ed] text-[#4153b4] rounded-full font-bold text-sm tracking-wider hover:bg-[#ece7e2] transition-colors">
                  Lưu lại
                </button>
              </div>
              
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
            <section className="mb-16">
              <h1 className="text-5xl font-bold text-[#1d1b18] mb-4 leading-tight">
                Khám phá cơ hội<br/><span className="text-[#4153b4] italic font-light">nghề nghiệp</span> mới.
              </h1>
              <p className="text-[#454652] max-w-xl text-lg">
                Tìm kiếm các vị trí tuyển dụng phù hợp với kỹ năng và đam mê của bạn.
              </p>
            </section>
            
            <div className="flex flex-col lg:flex-row gap-12">
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-8">
                  <div>
                    <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#4153b4] mb-4 block">Lọc tìm kiếm</span>
                    <div className="space-y-1">
                      {['Full-time', 'Part-time', 'Remote'].map(type => (
                        <label key={type} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f3ed] cursor-pointer transition-colors group">
                          <span className="text-sm text-[#454652] group-hover:text-[#4153b4]">{type}</span>
                          <input type="checkbox" className="rounded border-gray-300 text-[#4153b4]" />
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
                  <span className="text-sm text-[#454652]"><span className="font-bold text-[#1d1b18]">{jobs.length}</span> Vị trí tuyển dụng</span>
                </div>
                
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
                    <div className="text-center py-20">
                      <div className="w-20 h-20 rounded-full bg-[#f2ede7] flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#bac3ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-[#1d1b18] mb-2">Chưa có tin tuyển dụng nào</h3>
                      <p className="text-sm text-[#454652]">Các vị trí mới sẽ sớm được cập nhật.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {jobs.map(job => (
                        <JobCard key={job.jobId} job={job} onClick={setSelectedJob} />
                      ))}
                    </div>
                )}
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
