import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getSavedJobs, unsaveJob } from '../../services/jobService';

const ProfileSavedJobs = ({ token }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsavingId, setUnsavingId] = useState(null);

  const fetchSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedJobs(token);
      setJobs(data || []);
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSavedJobs(); }, [fetchSavedJobs]);

  const handleUnsave = async (jobId) => {
    setUnsavingId(jobId);
    try {
      await unsaveJob(jobId, token);
      setJobs(prev => prev.filter(j => j.jobId !== jobId));
    } catch (err) {
      console.error('Failed to unsave:', err);
    } finally {
      setUnsavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Chưa lưu công việc nào</p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Lưu các vị trí yêu thích để xem lại sau.</p>
        <Link to="/jobs" className="mt-5 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
          Khám phá việc làm
        </Link>
        <Link to="/applications" className="mt-2 text-sm text-primary font-semibold hover:underline">
          Xem ứng tuyển của tôi →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map(job => (
        <div key={job.jobId} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-600">
              {job.company?.logoUrl ? (
                <img src={job.company.logoUrl} alt="" className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-primary font-bold text-lg">{job.company?.name?.[0] || 'C'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                to={`/jobs?jobId=${job.jobId}`}
                className="font-bold text-slate-900 dark:text-white text-sm hover:text-primary transition-colors line-clamp-2"
              >
                {job.title}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{job.company?.name}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            {job.location && (
              <span className="flex items-center gap-1 text-[0.65rem] text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.employmentType && (
              <span className="px-2 py-0.5 bg-[#dee0ff] dark:bg-[#293d9d]/30 text-[#4153b4] dark:text-[#bac3ff] rounded-full text-[0.6rem] font-bold uppercase tracking-wider">
                {job.employmentType}
              </span>
            )}
            {(job.salaryMin || job.salaryMax) && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[0.6rem] font-bold">
                {job.salaryMin ? `$${job.salaryMin / 1000}k` : ''}
                {job.salaryMin && job.salaryMax ? ' - ' : ''}
                {job.salaryMax ? `$${job.salaryMax / 1000}k` : ''}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50 dark:border-slate-700">
            <Link
              to={`/jobs?jobId=${job.jobId}`}
              className="flex-1 py-2 bg-primary text-white rounded-lg text-xs font-bold text-center hover:bg-primary/90 transition-colors"
            >
              Xem chi tiết
            </Link>
            <button
              onClick={() => handleUnsave(job.jobId)}
              disabled={unsavingId === job.jobId}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Bỏ lưu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileSavedJobs;
