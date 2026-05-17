import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader.jsx';
import {
  getMyApplications,
  createExternalApplication,
  updateMyApplication,
  archiveMyApplication,
} from '../../services/applicationService.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const OFFICIAL_STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  SHORTLISTED: { label: 'Shortlisted', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  INTERVIEWED: { label: 'Interviewed', color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
  HIRED:       { label: 'Hired',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  REJECTED:    { label: 'Rejected',    color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
};

const CANDIDATE_STATUS_OPTIONS = [
  { value: 'APPLIED',    label: 'Applied' },
  { value: 'FOLLOW_UP',  label: 'Follow-up Needed' },
  { value: 'INTERVIEW',  label: 'Interview' },
  { value: 'OFFER',      label: 'Offer Received' },
  { value: 'REJECTED',   label: 'Rejected' },
  { value: 'WITHDRAWN',  label: 'Withdrawn' },
];

const CANDIDATE_STATUS_CONFIG = {
  APPLIED:    { color: 'text-slate-700',   bg: 'bg-slate-100 border-slate-200' },
  FOLLOW_UP:  { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  INTERVIEW:  { color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
  OFFER:      { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  REJECTED:   { color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  WITHDRAWN:  { color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

const isPast = (dateStr) => {
  if (!dateStr) return false;
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
};

// ─── Add External Application Modal ──────────────────────────────────────────

const AddExternalModal = ({ onClose, onCreated }) => {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    title: '', companyName: '', location: '', externalUrl: '',
    candidateStatus: 'APPLIED', appliedAt: '', notes: '',
    contactName: '', contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.companyName.trim()) {
      setError('Job title and company are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createExternalApplication(token, form);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-slate-900 dark:text-white">Add External Application</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Frontend Developer..." required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Company *</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Google, Meta..." required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Ho Chi Minh City..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
              <select name="candidateStatus" value={form.candidateStatus} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
                {CANDIDATE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Applied Date</label>
              <input type="date" name="appliedAt" value={form.appliedAt} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Link job</label>
              <input name="externalUrl" value={form.externalUrl} onChange={handleChange} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Name</label>
              <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="HR Manager..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
              <input name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" placeholder="hr@company.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Notes about this application..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary resize-none" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Saving...' : 'Add Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const DetailDrawer = ({ app, onClose, onUpdated, onArchiveToggle }) => {
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    candidateStatus: app.candidateStatus || 'APPLIED',
    notes: app.notes || '',
    followUpAt: app.followUpAt ? app.followUpAt.substring(0, 10) : '',
    interviewAt: app.interviewAt ? app.interviewAt.substring(0, 10) : '',
    contactName: app.contactName || '',
    contactEmail: app.contactEmail || '',
    contactPhone: app.contactPhone || '',
    externalUrl: app.externalUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyApplication(token, app.jobId, form);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const updated = await archiveMyApplication(token, app.jobId, !app.archived);
      onArchiveToggle(updated);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to archive.');
    } finally {
      setArchiving(false);
    }
  };

  const officialCfg = OFFICIAL_STATUS_CONFIG[app.officialStatus] || OFFICIAL_STATUS_CONFIG.PENDING;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between z-10">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{app.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{app.company?.name}</p>
          </div>
          <button onClick={onClose} className="ml-2 w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Official status (read-only) */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Recruiter Status</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${officialCfg.bg} ${officialCfg.color}`}>
              {officialCfg.label}
            </span>
          </div>

          {/* Candidate status */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Status</label>
            <select name="candidateStatus" value={form.candidateStatus} onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary">
              {CANDIDATE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Follow-up</label>
              <input type="date" name="followUpAt" value={form.followUpAt} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Interview Date</label>
              <input type="date" name="interviewAt" value={form.interviewAt} onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} placeholder="Add notes..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary resize-none" />
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</p>
            <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="HR Name..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            <input name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" placeholder="Email HR..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="Phone..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
          </div>

          {/* External URL */}
          {(app.source === 'external' || form.externalUrl) && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link job</label>
              <input name="externalUrl" value={form.externalUrl} onChange={handleChange} placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary" />
            </div>
          )}

          {app.source === 'internal' && (
            <Link to={`/jobs?jobId=${app.jobId}`}
              className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
              View Job Listing
            </Link>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-5 py-4 pb-safe flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={handleArchive} disabled={archiving}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 transition-colors">
            {archiving ? '...' : app.archived ? 'Restore' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ applications }) => {
  const stats = useMemo(() => {
    const active = applications.filter(a => !a.archived);
    const today = new Date();
    return {
      total: active.length,
      interviewing: active.filter(a => a.candidateStatus === 'INTERVIEW').length,
      offers: active.filter(a => a.candidateStatus === 'OFFER').length,
      followUpDue: active.filter(a => a.followUpAt && new Date(a.followUpAt) <= today).length,
    };
  }, [applications]);

  const items = [
    { label: 'Total Applied', value: stats.total, icon: 'work', color: 'text-primary' },
    { label: 'Interviewing', value: stats.interviewing, icon: 'forum', color: 'text-purple-600' },
    { label: 'Offers', value: stats.offers, icon: 'verified', color: 'text-emerald-600' },
    { label: 'Follow-up Due', value: stats.followUpDue, icon: 'schedule', color: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map(item => (
        <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 flex flex-col gap-1">
          <span className={`material-symbols-outlined ${item.color}`} style={{ fontSize: 22 }}>{item.icon}</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Application Card ─────────────────────────────────────────────────────────

const ApplicationCard = ({ app, onClick }) => {
  const officialCfg = OFFICIAL_STATUS_CONFIG[app.officialStatus] || OFFICIAL_STATUS_CONFIG.PENDING;
  const candidateCfg = CANDIDATE_STATUS_CONFIG[app.candidateStatus] || CANDIDATE_STATUS_CONFIG.APPLIED;
  const candidateLabel = CANDIDATE_STATUS_OPTIONS.find(o => o.value === app.candidateStatus)?.label || app.candidateStatus;
  const followUpOverdue = app.followUpAt && isPast(app.followUpAt) && app.candidateStatus !== 'OFFER' && app.candidateStatus !== 'REJECTED' && app.candidateStatus !== 'WITHDRAWN';

  return (
    <button onClick={() => onClick(app)} className="w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md hover:border-primary/30 transition-all flex gap-3 group">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
        {app.company?.logoUrl ? (
          <img src={app.company.logoUrl} alt="" className="w-7 h-7 object-contain" />
        ) : (
          <span className="text-primary font-bold text-sm">{(app.company?.name || 'C')[0].toUpperCase()}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{app.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{app.company?.name}</p>
          </div>
          {app.source === 'external' && (
            <span className="flex-shrink-0 text-[0.6rem] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded font-semibold uppercase">external</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${officialCfg.bg} ${officialCfg.color}`}>
            {officialCfg.label}
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold border ${candidateCfg.bg} ${candidateCfg.color}`}>
            {candidateLabel}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {app.appliedAt && (
            <span className="text-[0.65rem] text-slate-400">Applied: {formatDate(app.appliedAt)}</span>
          )}
          {app.followUpAt && (
            <span className={`text-[0.65rem] flex items-center gap-0.5 ${followUpOverdue ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>schedule</span>
              {formatDate(app.followUpAt)}
            </span>
          )}
          {app.interviewAt && (
            <span className="text-[0.65rem] text-purple-600 flex items-center gap-0.5 font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>forum</span>
              {formatDate(app.interviewAt)}
            </span>
          )}
        </div>
      </div>

      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary self-center flex-shrink-0 transition-colors" style={{ fontSize: 18 }}>chevron_right</span>
    </button>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); }
  }, [token, navigate]);

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (showArchived) filters.archived = 'true';
      const data = await getMyApplications(token, filters);
      setApplications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [token, showArchived]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filterStatus && app.candidateStatus !== filterStatus) return false;
      if (filterSource && (app.source || 'internal') !== filterSource) return false;
      if (filterSearch) {
        const q = filterSearch.toLowerCase();
        const matchTitle = (app.title || '').toLowerCase().includes(q);
        const matchCompany = (app.company?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany) return false;
      }
      return true;
    });
  }, [applications, filterStatus, filterSource, filterSearch]);

  const handleUpdated = (updated) => {
    setApplications(prev => prev.map(a => a.jobId === updated.jobId ? updated : a));
    setSelectedApp(updated);
  };

  const handleArchiveToggle = (updated) => {
    setApplications(prev => prev.filter(a => a.jobId !== updated.jobId));
    setSelectedApp(null);
  };

  const handleCreated = (created) => {
    setApplications(prev => [created, ...prev]);
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AppHeader activeTab="applications" />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Applications</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track all positions you've applied for</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Add External
          </button>
        </div>

        {/* Stats */}
        {!loading && <StatsBar applications={applications} />}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4 flex flex-wrap gap-3">
          <input
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Search by title, company..."
            className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-primary"
          />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary">
            <option value="">All Statuses</option>
            {CANDIDATE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary">
            <option value="">All Sources</option>
            <option value="internal">Korra</option>
            <option value="external">External</option>
          </select>
          <button
            onClick={() => setShowArchived(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${showArchived ? 'bg-primary/10 border-primary/30 text-primary' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>inventory_2</span>
            {showArchived ? 'Viewing Archived' : 'Archived'}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-red-400 text-5xl block mb-3">error</span>
            <p className="text-slate-500 dark:text-slate-400">{error}</p>
            <button onClick={fetchApplications} className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90">
              Retry
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl block mb-4">work_off</span>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {applications.length === 0 ? 'No applications yet' : 'No matching results'}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {applications.length === 0 ? 'Find and apply to jobs you love.' : 'Try adjusting your filters.'}
            </p>
            {applications.length === 0 && (
              <div className="flex gap-3 mt-5">
                <Link to="/jobs" className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Find Jobs
                </Link>
                <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-semibold hover:border-primary/30 transition-colors">
                  Add Manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map(app => (
              <ApplicationCard key={app.jobId} app={app} onClick={setSelectedApp} />
            ))}
          </div>
        )}
      </main>

      {selectedApp && (
        <DetailDrawer
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdated={handleUpdated}
          onArchiveToggle={handleArchiveToggle}
        />
      )}

      {showAddModal && (
        <AddExternalModal
          onClose={() => setShowAddModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default ApplicationTracker;
