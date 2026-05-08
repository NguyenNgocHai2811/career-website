import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import AppHeader from '../../components/AppHeader/AppHeader';

import ProfilePosts from './ProfilePosts';
import ProfileActivity from './ProfileActivity';
import { sendConnectionRequest, removeConnection, acceptConnectionRequest } from '../../services/networkService';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ===========================
// MODAL COMPONENTS
// ===========================

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, name, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
    {type === 'textarea' ? (
      <textarea
        name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4}
        className="w-full mt-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-primary outline-none"
      />
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full mt-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
      />
    )}
  </div>
);

const SaveBtn = ({ loading, onClose }) => (
  <div className="flex justify-end gap-3 mt-6">
    <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
    <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2">
      {loading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
      Save
    </button>
  </div>
);

// Basic Info Modal
const BasicInfoModal = ({ data, token, onSave, onClose }) => {
  const [form, setForm] = useState({ fullName: data.fullName || '', headline: data.headline || '', pronouns: data.pronouns || '', location: data.location || '', about: data.about || '', website: data.contactInfo?.website || '', phone: data.contactInfo?.phone || '', birthday: data.contactInfo?.birthday || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    const res = await fetch(`${API}/v1/users/profile/basic-info`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <ModalWrapper title="Edit Basic Info" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
        <Field label="Headline" name="headline" value={form.headline} onChange={handleChange} placeholder="e.g. Software Engineer at Google" />
        <Field label="Pronouns" name="pronouns" value={form.pronouns} onChange={handleChange} placeholder="e.g. He/Him" />
        <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
        <Field label="About" name="about" type="textarea" value={form.about} onChange={handleChange} placeholder="Write a brief bio..." />
        <Field label="Website" name="website" value={form.website} onChange={handleChange} placeholder="yourwebsite.com" />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <Field label="Birthday" name="birthday" value={form.birthday} onChange={handleChange} placeholder="e.g. June 15" />
        <SaveBtn loading={loading} onClose={onClose} />
      </form>
    </ModalWrapper>
  );
};

// Experience Modal
const ExperienceModal = ({ exp, token, onSave, onClose }) => {
  const isEdit = !!exp?.expId;
  const [form, setForm] = useState({ title: exp?.title || '', company: exp?.company || '', type: exp?.type || 'Full-time', startDate: exp?.startDate || '', endDate: exp?.endDate || '', isCurrent: exp?.isCurrent || false, location: exp?.location || '', description: exp?.description || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    const url = isEdit ? `${API}/v1/users/profile/experience/${exp.expId}` : `${API}/v1/users/profile/experience`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <ModalWrapper title={isEdit ? 'Edit Experience' : 'Add Experience'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Job Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Software Engineer" />
        <Field label="Company" name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google" />
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employment Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full mt-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary">
            {['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Field label="Location" name="location" value={form.location} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} placeholder="Jan 2022" />
          <Field label="End Date" name="endDate" value={form.endDate} onChange={handleChange} placeholder="Present" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" name="isCurrent" checked={form.isCurrent} onChange={handleChange} className="accent-primary" />
          I currently work here
        </label>
        <Field label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
        <SaveBtn loading={loading} onClose={onClose} />
      </form>
    </ModalWrapper>
  );
};

// Education Modal
const EducationModal = ({ edu, token, onSave, onClose }) => {
  const isEdit = !!edu?.eduId;
  const [form, setForm] = useState({ schoolName: edu?.schoolName || '', degree: edu?.degree || '', field: edu?.field || '', startYear: edu?.startYear || '', endYear: edu?.endYear || '', grade: edu?.grade || '', description: edu?.description || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    const url = isEdit ? `${API}/v1/users/profile/education/${edu.eduId}` : `${API}/v1/users/profile/education`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <ModalWrapper title={isEdit ? 'Edit Education' : 'Add Education'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="School / University" name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="e.g. Quy Nhon University" />
        <Field label="Degree" name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. Bachelor of Science" />
        <Field label="Field of Study" name="field" value={form.field} onChange={handleChange} placeholder="e.g. Computer Science" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Year" name="startYear" value={form.startYear} onChange={handleChange} placeholder="2018" />
          <Field label="End Year" name="endYear" value={form.endYear} onChange={handleChange} placeholder="2022" />
        </div>
        <Field label="Grade / GPA" name="grade" value={form.grade} onChange={handleChange} />
        <Field label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
        <SaveBtn loading={loading} onClose={onClose} />
      </form>
    </ModalWrapper>
  );
};

// Project Modal
const ProjectModal = ({ proj, token, onSave, onClose }) => {
  const isEdit = !!proj?.projId;
  const [form, setForm] = useState({ name: proj?.name || '', description: proj?.description || '', year: proj?.year || '', category: proj?.category || '', link: proj?.link || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    const url = isEdit ? `${API}/v1/users/profile/projects/${proj.projId}` : `${API}/v1/users/profile/projects`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <ModalWrapper title={isEdit ? 'Edit Project' : 'Add Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Project Name" name="name" value={form.name} onChange={handleChange} />
        <Field label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Year" name="year" value={form.year} onChange={handleChange} placeholder="2024" />
          <Field label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. UX Research" />
        </div>
        <Field label="Project URL" name="link" value={form.link} onChange={handleChange} placeholder="https://..." />
        <SaveBtn loading={loading} onClose={onClose} />
      </form>
    </ModalWrapper>
  );
};

// Certification Modal
const CertificationModal = ({ cert, token, onSave, onClose }) => {
  const isEdit = !!cert?.certId;
  const [form, setForm] = useState({ name: cert?.name || '', organization: cert?.organization || '', issueDate: cert?.issueDate || '', expiryDate: cert?.expiryDate || '', credentialId: cert?.credentialId || '', credentialUrl: cert?.credentialUrl || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    const url = isEdit ? `${API}/v1/users/profile/certifications/${cert.certId}` : `${API}/v1/users/profile/certifications`;
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setLoading(false);
    if (res.ok) { onSave(); onClose(); }
  };

  return (
    <ModalWrapper title={isEdit ? 'Edit Certification' : 'Add Certification'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Certification Name" name="name" value={form.name} onChange={handleChange} />
        <Field label="Issuing Organization" name="organization" value={form.organization} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Issue Date" name="issueDate" value={form.issueDate} onChange={handleChange} placeholder="Aug 2022" />
          <Field label="Expiry Date" name="expiryDate" value={form.expiryDate} onChange={handleChange} placeholder="No expiry" />
        </div>
        <Field label="Credential ID" name="credentialId" value={form.credentialId} onChange={handleChange} />
        <Field label="Credential URL" name="credentialUrl" value={form.credentialUrl} onChange={handleChange} placeholder="https://..." />
        <SaveBtn loading={loading} onClose={onClose} />
      </form>
    </ModalWrapper>
  );
};

// Skills Panel (inline, not modal)
const SkillsManager = ({ skills, isOwner, token, onSave }) => {
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newSkill.trim()) return;
    setLoading(true);
    const res = await fetch(`${API}/v1/users/profile/skills`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ skillName: newSkill.trim() }),
    });
    setLoading(false);
    if (res.ok) { setNewSkill(''); onSave(); }
  };

  const handleRemove = async (skillName) => {
    const res = await fetch(`${API}/v1/users/profile/skills/${encodeURIComponent(skillName)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onSave();
  };

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <span key={idx} className="group flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pastel-blue/20 text-xs font-semibold text-slate-900 dark:text-slate-200 border border-pastel-blue/30 hover:bg-pastel-blue/30 transition-all">
          {skill}
          {isOwner && (
            <button onClick={() => handleRemove(skill)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-red-400 hover:text-red-600 leading-none">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </span>
      ))}
      {isOwner && (
        <div className="flex gap-2 mt-1 w-full">
          <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())} placeholder="Add a skill..." className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={handleAdd} disabled={loading || !newSkill.trim()} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors">
            Add
          </button>
        </div>
      )}
    </div>
  );
};

// Edit button shown only for owners
const EditBtn = ({ onClick }) => (
  <button onClick={onClick} data-html2canvas-ignore="true" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
    <span className="material-symbols-outlined text-[20px]">edit</span>
  </button>
);

const AddBtn = ({ onClick }) => (
  <button onClick={onClick} data-html2canvas-ignore="true" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
    <span className="material-symbols-outlined text-[20px]">add</span>
  </button>
);

// ===========================
// MAIN PROFILE COMPONENT
// ===========================

const Profile = ({ tab = 'profile' }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connStatus, setConnStatus] = useState('NONE'); // NONE | PENDING_SENT | PENDING_RECEIVED | CONNECTED
  const [connLoading, setConnLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null); // { type, data }
  const openModal = (type, data = null) => setModal({ type, data });
  const closeModal = () => setModal(null);

  // Avatar/Banner upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // PDF Export state
  const profileRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const pdfStyleHits = [];
    const pushPdfStyleHit = (el, prop, val, pseudo) => {
      if (pdfStyleHits.length >= 80) return;
      pdfStyleHits.push({
        tag: el?.tagName || '',
        id: el?.id || '',
        className: typeof el?.className === 'string' ? el.className : '',
        prop: prop || '',
        value: val || '',
        pseudo: pseudo || ''
      });
    };
    const clamp01 = (x) => Math.min(1, Math.max(0, x));
    const toByte = (x) => Math.round(clamp01(x) * 255);
    const srgbFromLinear = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
    const parseAlpha = (a) => {
      if (!a) return 1;
      const s = String(a).trim();
      if (!s) return 1;
      if (s.endsWith('%')) return clamp01(parseFloat(s) / 100);
      const n = parseFloat(s);
      return Number.isFinite(n) ? clamp01(n) : 1;
    };
    const oklchToRgba = (l, c, hDeg, alpha = 1) => {
      const h = (Number(hDeg) * Math.PI) / 180;
      const a = Number(c) * Math.cos(h);
      const b = Number(c) * Math.sin(h);
      const L = Number(l);
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;
      const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
      const r = srgbFromLinear(rLin);
      const g = srgbFromLinear(gLin);
      const bl = srgbFromLinear(bLin);
      return `rgba(${toByte(r)}, ${toByte(g)}, ${toByte(bl)}, ${clamp01(alpha)})`;
    };
    const parseOklchInner = (inner) => {
      if (!inner || typeof inner !== 'string') return null;
      const parts = inner.split('/');
      const main = (parts[0] || '').trim();
      const alpha = parseAlpha(parts[1]);
      const nums = main.split(/\s+/).filter(Boolean);
      if (nums.length < 3) return null;
      const lRaw = nums[0];
      const cRaw = nums[1];
      const hRaw = nums[2];
      const l = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
      const c = parseFloat(cRaw);
      const h = parseFloat(String(hRaw).replace(/deg$/i, ''));
      if (![l, c, h].every(Number.isFinite)) return null;
      return oklchToRgba(l, c, h, alpha);
    };
    const replaceOklchInString = (val) => {
      if (!val || typeof val !== 'string' || !/oklch\s*\(/i.test(val)) return val;
      return val.replace(/oklch\s*\(\s*([^\)]*?)\s*\)/gi, (full, inner) => {
        const rgba = parseOklchInner(inner);
        return rgba || 'rgba(0,0,0,0)';
      });
    };
    const oklabToRgba = (l, a, b, alpha = 1) => {
      const L = Number(l);
      const A = Number(a);
      const B = Number(b);
      const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
      const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
      const s_ = L - 0.0894841775 * A - 1.291485548 * B;
      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;
      const rLin = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
      const r = srgbFromLinear(rLin);
      const g = srgbFromLinear(gLin);
      const bl = srgbFromLinear(bLin);
      return `rgba(${toByte(r)}, ${toByte(g)}, ${toByte(bl)}, ${clamp01(alpha)})`;
    };
    const parseOklabInner = (inner) => {
      if (!inner || typeof inner !== 'string') return null;
      const parts = inner.split('/');
      const main = (parts[0] || '').trim();
      const alpha = parseAlpha(parts[1]);
      const nums = main.split(/\s+/).filter(Boolean);
      if (nums.length < 3) return null;
      const lRaw = nums[0];
      const aRaw = nums[1];
      const bRaw = nums[2];
      const l = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
      const a = parseFloat(aRaw);
      const b = parseFloat(bRaw);
      if (![l, a, b].every(Number.isFinite)) return null;
      return oklabToRgba(l, a, b, alpha);
    };
    const replaceOklabInString = (val) => {
      if (!val || typeof val !== 'string' || !/oklab\s*\(/i.test(val)) return val;
      return val.replace(/oklab\s*\(\s*([^\)]*?)\s*\)/gi, (full, inner) => {
        const rgba = parseOklabInner(inner);
        return rgba || 'rgba(0,0,0,0)';
      });
    };
    const labToRgba = (L, a, b, alpha = 1) => {
      const fy = (Number(L) + 16) / 116;
      const fx = Number(a) / 500 + fy;
      const fz = fy - Number(b) / 200;
      const eps = 216 / 24389;
      const kap = 24389 / 27;
      const xr = fx ** 3 > eps ? fx ** 3 : (116 * fx - 16) / kap;
      const yr = Number(L) > kap * eps ? ((Number(L) + 16) / 116) ** 3 : Number(L) / kap;
      const zr = fz ** 3 > eps ? fz ** 3 : (116 * fz - 16) / kap;
      const x50 = xr * 0.9642, y50 = yr, z50 = zr * 0.8249;
      const xd = 0.9555766 * x50 - 0.0230393 * y50 + 0.0631636 * z50;
      const yd = -0.0282895 * x50 + 1.0099416 * y50 + 0.0210077 * z50;
      const zd = 0.0122982 * x50 - 0.0204830 * y50 + 1.3299098 * z50;
      const rLin = 3.2404542 * xd - 1.5371385 * yd - 0.4985314 * zd;
      const gLin = -0.9692660 * xd + 1.8760108 * yd + 0.0415560 * zd;
      const bLin = 0.0556434 * xd - 0.2040259 * yd + 1.0572252 * zd;
      return `rgba(${toByte(srgbFromLinear(rLin))}, ${toByte(srgbFromLinear(gLin))}, ${toByte(srgbFromLinear(bLin))}, ${clamp01(alpha)})`;
    };
    const parseLabInner = (inner) => {
      if (!inner || typeof inner !== 'string') return null;
      const parts = inner.split('/');
      const main = (parts[0] || '').trim();
      const alpha = parseAlpha(parts[1]);
      const nums = main.split(/\s+/).filter(Boolean);
      if (nums.length < 3) return null;
      const l = parseFloat(nums[0]);
      const a = nums[1].endsWith('%') ? parseFloat(nums[1]) * 1.25 : parseFloat(nums[1]);
      const b = nums[2].endsWith('%') ? parseFloat(nums[2]) * 1.25 : parseFloat(nums[2]);
      if (![l, a, b].every(Number.isFinite)) return null;
      return labToRgba(l, a, b, alpha);
    };
    const replaceLabInString = (val) => {
      if (!val || typeof val !== 'string' || !/\blab\s*\(/i.test(val)) return val;
      return val.replace(/\blab\s*\(\s*([^\)]*?)\s*\)/gi, (full, inner) => {
        const rgba = parseLabInner(inner);
        return rgba || 'rgba(0,0,0,0)';
      });
    };
    const lchToRgba = (L, C, H, alpha = 1) => {
      const a = Number(C) * Math.cos(Number(H) * Math.PI / 180);
      const b = Number(C) * Math.sin(Number(H) * Math.PI / 180);
      return labToRgba(L, a, b, alpha);
    };
    const parseLchInner = (inner) => {
      if (!inner || typeof inner !== 'string') return null;
      const parts = inner.split('/');
      const main = (parts[0] || '').trim();
      const alpha = parseAlpha(parts[1]);
      const nums = main.split(/\s+/).filter(Boolean);
      if (nums.length < 3) return null;
      const l = parseFloat(nums[0]);
      const c = parseFloat(nums[1]);
      const h = parseFloat(String(nums[2]).replace(/deg$/i, ''));
      if (![l, c, h].every(Number.isFinite)) return null;
      return lchToRgba(l, c, h, alpha);
    };
    const replaceLchInString = (val) => {
      if (!val || typeof val !== 'string' || !/\blch\s*\(/i.test(val)) return val;
      return val.replace(/\blch\s*\(\s*([^\)]*?)\s*\)/gi, (full, inner) => {
        const rgba = parseLchInner(inner);
        return rgba || 'rgba(0,0,0,0)';
      });
    };
    const normalizeCssValue = (val, propName) => {
      if (!val || typeof val !== 'string') return val;
      let out = val;
      if (/oklch\s*\(/i.test(out)) out = replaceOklchInString(out);
      if (/oklab\s*\(/i.test(out)) out = replaceOklabInString(out);
      if (/\blab\s*\(/i.test(out)) out = replaceLabInString(out);
      if (/\blch\s*\(/i.test(out)) out = replaceLchInString(out);
      const hasUnsupported = out.includes('color-mix')
        || /okl(?:ab|ch)\s*\(/i.test(out)
        || /\b(?:lab|lch)\s*\(/i.test(out)
        || /\bcolor\s*\(\s*(?:display-p3|a98-rgb|prophoto-rgb|rec2020|srgb-linear|xyz)/i.test(out);
      if (hasUnsupported) {
        const p = String(propName || '').toLowerCase();
        if (p.includes('background-image') || p === 'background') return 'none';
        if (p.includes('background')) return '#ffffff';
        if (p.includes('color') || p.includes('fill') || p.includes('stroke')) return '#0f172a';
        if (p.includes('border') || p.includes('outline')) return '#cbd5e1';
        if (p.includes('shadow')) return 'none';
        return 'none';
      }
      return out;
    };
    const createComputedStyleProxy = (computed, el, pseudo) => new Proxy(computed, {
      get(target, prop) {
        if (prop === 'getPropertyValue') {
          return function (p) {
            const val = target.getPropertyValue(p);
            const norm = normalizeCssValue(val, p);
            if (val !== norm && (/okl(?:ab|ch)\s*\(/i.test(val) || /\b(?:lab|lch)\s*\(/i.test(val) || val.includes('color-mix'))) pushPdfStyleHit(el, p, val, pseudo);
            return norm;
          };
        }
        const val = target[prop];
        if (val && typeof val === 'string' && (/okl(?:ab|ch)\s*\(/i.test(val) || /\b(?:lab|lch)\s*\(/i.test(val) || val.includes('color-mix'))) {
          pushPdfStyleHit(el, typeof prop === 'string' ? prop : '', val, pseudo);
          return normalizeCssValue(val, typeof prop === 'string' ? prop : '');
        }
        return typeof val === 'function' ? val.bind(target) : val;
      }
    });
    const patchGetComputedStyle = (targetWindow) => {
      const orig = targetWindow.getComputedStyle;
      targetWindow.getComputedStyle = function (el, pseudo) {
        const computed = orig.call(targetWindow, el, pseudo);
        return createComputedStyleProxy(computed, el, pseudo);
      };
      return () => { targetWindow.getComputedStyle = orig; };
    };
    let exportContainer = null;
    let restoreGetComputedStyle = null;
    try {
      setIsExporting(true);
      // Cần một khoảng trễ nhỏ để React kịp render ẩn các nút bấm trước khi chụp màn hình
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = profileRef.current;
      if (!element) throw new Error('Profile element not found');

      // Render from an off-screen clone and strip cross-origin images to avoid canvas taint/CORS failures.
      const clonedElement = element.cloneNode(true);
      const images = clonedElement.querySelectorAll('img');
      images.forEach((img) => {
        img.setAttribute('crossorigin', 'anonymous');
        img.setAttribute('referrerpolicy', 'no-referrer');
      });

      exportContainer = document.createElement('div');
      exportContainer.id = 'pdf-export-container';
      exportContainer.style.position = 'fixed';
      exportContainer.style.left = '-100000px';
      exportContainer.style.top = '0';
      const exportWidth = 900;
      exportContainer.style.width = `${exportWidth}px`;
      exportContainer.style.background = '#ffffff';

      const safeStyle = document.createElement('style');
      safeStyle.textContent = `
        #pdf-export-root {
          background-color: #ffffff !important;
          padding: 24px !important;
          box-sizing: border-box !important;
        }
        #pdf-export-root, #pdf-export-root * {
          box-sizing: border-box !important;
        }
        #pdf-export-root > main {
          width: 100% !important;
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        #pdf-export-root .md\\:px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        #pdf-export-root .md\\:px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
        #pdf-export-root .md\\:rounded-xl { border-radius: 0.75rem !important; }
        #pdf-export-root .md\\:h-60 { height: 15rem !important; }
        #pdf-export-root .md\\:flex-row { flex-direction: row !important; }
        #pdf-export-root .md\\:-mt-20 { margin-top: -5rem !important; }
        #pdf-export-root .md\\:size-36 { width: 9rem !important; height: 9rem !important; }
        #pdf-export-root .md\\:flex { display: flex !important; }
        #pdf-export-root .md\\:text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
        #pdf-export-root .md\\:hidden { display: none !important; }
        #pdf-export-root .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      `;
      const captureRoot = document.createElement('div');
      captureRoot.id = 'pdf-export-root';
      captureRoot.appendChild(safeStyle);
      captureRoot.appendChild(clonedElement);
      exportContainer.appendChild(captureRoot);
      document.body.appendChild(exportContainer);

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `${profileData?.fullName?.replace(/\s+/g, '_') || 'Profile'}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          width: exportWidth,
          windowWidth: exportWidth,
          windowHeight: Math.max(element.scrollHeight || 0, element.clientHeight || 0, window.innerHeight || 0),
          // Avoid tainted canvas when profile has remote images without permissive CORS headers.
          allowTaint: false,
          letterRendering: false,
          scrollY: 0,
          scrollX: 0,
          imageTimeout: 15000,
          onclone: (clonedDoc) => {
            patchGetComputedStyle(clonedDoc.defaultView);
          }
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      restoreGetComputedStyle = patchGetComputedStyle(window);
      await html2pdf().set(opt).from(captureRoot).save();
    } catch (err) {
      console.error('PDF Export Error:', err);
      if (pdfStyleHits.length) {
        console.groupCollapsed('PDF Export: Unsupported color hits');
        console.table(pdfStyleHits);
        console.groupEnd();
      } else {
        console.warn('PDF Export: No style hits captured');
      }
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      alert(`Lỗi: ${err.name} - ${err.message}`);
    } finally {
      if (restoreGetComputedStyle) restoreGetComputedStyle();
      if (exportContainer?.parentNode) {
        exportContainer.parentNode.removeChild(exportContainer);
      }
      setIsExporting(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const targetId = userId || (() => {
        try { return JSON.parse(localStorage.getItem('user'))?.userId; } catch { return null; }
      })();

      if (!targetId) { navigate('/login'); return; }

      const res = await fetch(`${API}/v1/users/${targetId}/profile`, { headers });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfileData(data);
      setConnStatus(data.connectionStatus || 'NONE');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, token, navigate]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleConnect = async () => {
    setConnLoading(true);
    try {
      await sendConnectionRequest(token, userId);
      setConnStatus('PENDING_SENT');
    } catch (e) { alert(e.message); }
    finally { setConnLoading(false); }
  };

  const handleAcceptRequest = async () => {
    setConnLoading(true);
    try {
      await acceptConnectionRequest(token, userId);
      setConnStatus('CONNECTED');
      fetchProfile();
    } catch (e) { alert(e.message); }
    finally { setConnLoading(false); }
  };

  const handleUnfriend = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy kết bạn?')) return;
    setConnLoading(true);
    try {
      await removeConnection(token, userId);
      setConnStatus('NONE');
      fetchProfile();
    } catch (e) { alert(e.message); }
    finally { setConnLoading(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API}/v1/users/profile/avatar`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    setUploadingAvatar(false);
    if (res.ok) fetchProfile();
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('banner', file);
    const res = await fetch(`${API}/v1/users/profile/banner`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    setUploadingBanner(false);
    if (res.ok) fetchProfile();
  };

  const handleDeleteItem = async (endpoint) => {
    const res = await fetch(`${API}/v1/users/profile/${endpoint}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) fetchProfile();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1b26]">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span className="material-symbols-outlined text-5xl animate-spin text-primary">progress_activity</span>
        <p className="text-sm font-medium">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#1a1b26] text-red-500">
      <p className="text-sm font-medium">⚠️ {error}</p>
    </div>
  );

  if (!profileData) return null;

  const { isOwner } = profileData;

  return (
    <div className="bg-slate-50 dark:bg-[#1a1b26] font-display text-slate-800 dark:text-slate-100 min-h-screen flex flex-col">

      {/* Hidden file inputs for upload */}
      <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

      {/* Modals */}
      {modal?.type === 'basicInfo' && <BasicInfoModal data={profileData} token={token} onSave={fetchProfile} onClose={closeModal} />}
      {modal?.type === 'experience' && <ExperienceModal exp={modal.data} token={token} onSave={fetchProfile} onClose={closeModal} />}
      {modal?.type === 'education' && <EducationModal edu={modal.data} token={token} onSave={fetchProfile} onClose={closeModal} />}
      {modal?.type === 'project' && <ProjectModal proj={modal.data} token={token} onSave={fetchProfile} onClose={closeModal} />}
      {modal?.type === 'certification' && <CertificationModal cert={modal.data} token={token} onSave={fetchProfile} onClose={closeModal} />}

      {/* Shared Header */}
      <AppHeader activeTab="profile" />

      <main ref={profileRef} className="flex-1 w-full max-w-7xl mx-auto px-0 md:px-4 py-6 space-y-6">

        {/* ===== PROFILE HEADER CARD ===== */}
        <header className="bg-white dark:bg-slate-800 md:rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative group">
          {/* Banner */}
          <div className="h-48 md:h-60 w-full relative overflow-hidden">
            {profileData.bannerUrl ? (
              <img src={profileData.bannerUrl} alt="Banner" className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400" />
            )}
            {isOwner && !isExporting && (
              <button
                onClick={() => document.getElementById('banner-upload').click()}
                disabled={uploadingBanner}
                className="absolute top-4 right-4 bg-black/40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-black/60 transition-colors backdrop-blur-sm"
              >
                {uploadingBanner ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">photo_camera</span>}
                {uploadingBanner ? 'Uploading...' : 'Edit cover'}
              </button>
            )}
          </div>

          {/* User Info Row */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              {/* Avatar */}
              <div className="-mt-16 md:-mt-20 mb-3 relative group/avatar">
                <div className="size-28 md:size-36 rounded-xl border-4 border-white dark:border-slate-800 bg-slate-200 shadow-xl overflow-hidden">
                  {profileData.avatarUrl ? (
                    <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-purple-400/30">
                      <span className="material-symbols-outlined text-5xl text-primary/60">person</span>
                    </div>
                  )}
                </div>
                {isOwner && !isExporting && (
                  <button
                    onClick={() => document.getElementById('avatar-upload').click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-2 right-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-primary p-1.5 rounded-lg shadow hover:scale-110 transition cursor-pointer"
                  >
                    {uploadingAvatar ? <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[16px]">edit</span>}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              {!isExporting && (
                <div className="hidden md:flex items-center gap-3 mt-4">
                  {isOwner ? (
                    <>
                      <button onClick={handleExportPDF} disabled={isExporting} className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                        {isExporting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">download</span>}
                        Tải PDF
                      </button>
                      <button onClick={() => openModal('basicInfo')} className="px-5 py-2 border border-primary text-primary font-semibold rounded-lg text-sm hover:bg-primary/5 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <>
                      {connStatus === 'NONE' && (
                        <button onClick={handleConnect} disabled={connLoading} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">person_add</span>
                          {connLoading ? 'Đang gửi...' : 'Kết bạn'}
                        </button>
                      )}
                      {connStatus === 'PENDING_SENT' && (
                        <button disabled className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-500 font-semibold rounded-lg flex items-center gap-2 text-sm cursor-default">
                          <span className="material-symbols-outlined text-[18px]">schedule</span>
                          Đã gửi lời mời
                        </button>
                      )}
                      {connStatus === 'PENDING_RECEIVED' && (
                        <button onClick={handleAcceptRequest} disabled={connLoading} className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 text-sm disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">check</span>
                          {connLoading ? 'Đang xử lý...' : 'Chấp nhận lời mời'}
                        </button>
                      )}
                      {connStatus === 'CONNECTED' && (
                        <button onClick={handleUnfriend} disabled={connLoading} className="px-6 py-2.5 bg-white dark:bg-transparent border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-lg transition-all flex items-center gap-2 text-sm disabled:opacity-60">
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                          {connLoading ? 'Đang xử lý...' : 'Hủy kết bạn'}
                        </button>
                      )}
                      <button onClick={() => navigate('/messages')} className="px-6 py-2.5 bg-white dark:bg-transparent border border-primary/50 text-primary hover:bg-primary/5 font-semibold rounded-lg transition-colors flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                        Nhắn tin
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Name & Details */}
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {profileData.fullName || 'New User'}
                </h1>
                {profileData.pronouns && (
                  <span className="text-slate-500 text-sm font-medium bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg">{profileData.pronouns}</span>
                )}
                {isOwner && !isExporting && (
                  <button onClick={() => openModal('basicInfo')} className="text-primary hover:text-primary/80 ml-1">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                )}
              </div>

              {profileData.headline && <p className="text-base text-slate-700 dark:text-slate-300 font-medium max-w-2xl">{profileData.headline}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
                {profileData.location && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-blue-400">location_on</span>
                    {profileData.location}
                  </span>
                )}
                {profileData.status && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-orange-400">work</span>
                    {profileData.status}
                  </span>
                )}
                {profileData.contactInfo?.website && (
                  <a href={`https://${profileData.contactInfo.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                    {profileData.contactInfo.website}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 mt-3 text-sm">
                <span className="font-bold text-slate-900 dark:text-white">{profileData.connectionsCount}</span>
                <span className="text-slate-500">connections</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-bold text-slate-900 dark:text-white">{profileData.followersCount}</span>
                <span className="text-slate-500">followers</span>
              </div>

              {/* Mobile action buttons */}
              {!isExporting && (
                <div className="flex md:hidden flex-wrap items-center gap-3 mt-4 w-full">
                  {isOwner ? (
                    <>
                      <button onClick={handleExportPDF} disabled={isExporting} className="w-full py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                        {isExporting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">download</span>}
                        Tải PDF
                      </button>
                      <button onClick={() => openModal('basicInfo')} className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <>
                      {connStatus === 'NONE' && (
                        <button onClick={handleConnect} disabled={connLoading} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg text-sm disabled:opacity-60">
                          {connLoading ? 'Đang gửi...' : 'Kết bạn'}
                        </button>
                      )}
                      {connStatus === 'PENDING_SENT' && (
                        <button disabled className="flex-1 py-2.5 bg-slate-100 text-slate-500 font-semibold rounded-lg text-sm cursor-default">Đã gửi lời mời</button>
                      )}
                      {connStatus === 'PENDING_RECEIVED' && (
                        <button onClick={handleAcceptRequest} disabled={connLoading} className="flex-1 py-2.5 bg-green-500 text-white font-semibold rounded-lg text-sm disabled:opacity-60">
                          {connLoading ? 'Đang xử lý...' : 'Chấp nhận'}
                        </button>
                      )}
                      {connStatus === 'CONNECTED' && (
                        <button onClick={handleUnfriend} disabled={connLoading} className="flex-1 py-2.5 border border-red-300 text-red-500 font-semibold rounded-lg text-sm disabled:opacity-60">
                          {connLoading ? 'Đang xử lý...' : 'Hủy kết bạn'}
                        </button>
                      )}
                      <button onClick={() => navigate('/messages')} className="flex-1 py-2.5 border border-primary text-primary font-semibold rounded-lg text-sm">Nhắn tin</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div data-html2canvas-ignore="true" className="flex items-center gap-8 px-6 md:px-8 border-t border-slate-100 dark:border-slate-700 pt-1 overflow-x-auto no-scrollbar">
            <button onClick={() => navigate(userId ? `/profile/${userId}` : '/profile')} className={`px-1 py-3 border-b-[3px] font-medium text-sm whitespace-nowrap transition-colors ${tab === 'profile' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-primary hover:border-slate-200 dark:hover:text-white'}`}>Profile</button>
            <button onClick={() => navigate(userId ? `/profile/${userId}/posts` : '/profile/me/posts')} className={`px-1 py-3 border-b-[3px] font-medium text-sm whitespace-nowrap transition-colors ${tab === 'posts' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-primary hover:border-slate-200 dark:hover:text-white'}`}>Posts</button>
            <button onClick={() => navigate(userId ? `/profile/${userId}/activity` : '/profile/me/activity')} className={`px-1 py-3 border-b-[3px] font-medium text-sm whitespace-nowrap transition-colors ${tab === 'activity' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-primary hover:border-slate-200 dark:hover:text-white'}`}>Activity</button>
          </div>
        </header>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===== LEFT SIDEBAR ===== */}
          <aside className="lg:col-span-4 space-y-5">

            {/* About */}
            {(profileData.about || isOwner) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-primary text-lg">About</h3>
                  {isOwner && <EditBtn onClick={() => openModal('basicInfo')} />}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {profileData.about || <span className="text-slate-400 italic">No bio yet. Click edit to add one.</span>}
                </p>
              </div>
            )}

            {/* Contact Info */}
            {(isOwner || profileData.contactInfo?.website || profileData.contactInfo?.email) && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-primary text-lg">Contact Info</h3>
                  {isOwner && <EditBtn onClick={() => openModal('basicInfo')} />}
                </div>
                <ul className="space-y-3">
                  {profileData.contactInfo?.website && (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">language</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-xs text-slate-500">Website</p>
                        <a href={`https://${profileData.contactInfo.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">{profileData.contactInfo.website}</a>
                      </div>
                    </li>
                  )}
                  {isOwner && profileData.contactInfo?.email && (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="size-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-xs text-slate-500">Email</p>
                        <a href={`mailto:${profileData.contactInfo.email}`} className="text-primary hover:underline text-xs">{profileData.contactInfo.email}</a>
                      </div>
                    </li>
                  )}
                  {profileData.contactInfo?.birthday && (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="size-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-400">
                        <span className="material-symbols-outlined text-[18px]">cake</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-xs text-slate-500">Birthday</p>
                        <span className="text-slate-600 dark:text-slate-400 text-xs">{profileData.contactInfo.birthday}</span>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Education */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">Education</h3>
                {isOwner && (
                  <div className="flex gap-1">
                    <AddBtn onClick={() => openModal('education')} />
                  </div>
                )}
              </div>
              {profileData.education?.length > 0 ? profileData.education.map(edu => (
                <div key={edu.eduId} className="flex gap-3 items-start mt-4 first:mt-0">
                  <div className="size-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0 text-secondary mt-1">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.schoolName}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ''}</p>
                      </div>
                      {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => openModal('education', edu)} className="text-primary hover:text-primary/80">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteItem(`education/${edu.eduId}`)} className="text-red-400 hover:text-red-600">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">{isOwner ? 'Add your education history.' : 'No education added yet.'}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">Skills <span className="text-sm text-slate-400 font-normal">({profileData.totalSkillsCount})</span></h3>
              </div>
              <SkillsManager skills={profileData.skills || []} isOwner={isOwner} token={token} onSave={fetchProfile} />
            </div>

          </aside>

          {/* ===== RIGHT MAIN CONTENT ===== */}
          <section className="lg:col-span-8 space-y-5">
            {tab === 'profile' && (
              <>

                {/* Experience */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Experience</h2>
                    {isOwner && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('experience')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition">
                          <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {profileData.experiences?.length > 0 ? (
                    <div className="space-y-6">
                      {profileData.experiences.map(exp => (
                        <div key={exp.expId} className="flex gap-4">
                          <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                            {exp.logoUrl ? <img alt={exp.company} className="size-8 object-contain" src={exp.logoUrl} crossOrigin="anonymous" /> : <span className="material-symbols-outlined text-slate-400">domain</span>}
                          </div>
                          <div className="flex-1 pb-6 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{exp.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{exp.company} · {exp.type}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{exp.startDate}{exp.isCurrent ? ' – Present' : exp.endDate ? ` – ${exp.endDate}` : ''}</p>
                                {exp.location && <p className="text-xs text-slate-500">{exp.location}</p>}
                              </div>
                              {isOwner && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => openModal('experience', exp)} className="text-primary hover:text-primary/80">
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button onClick={() => handleDeleteItem(`experience/${exp.expId}`)} className="text-red-400 hover:text-red-600">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                            {exp.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{exp.description}</p>}
                            {exp.skills?.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {exp.skills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{s}</span>)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{isOwner ? 'Add your work experience.' : 'No experience added yet.'}</p>
                  )}
                </div>

                {/* Projects */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Projects</h2>
                    {isOwner && (
                      <button onClick={() => openModal('project')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    )}
                  </div>
                  {profileData.projects?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.projects.map(proj => (
                        <div key={proj.projId} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all group/card bg-white dark:bg-slate-800 flex flex-col">
                          <div className="h-28 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-blue-300">rocket_launch</span>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover/card:text-primary transition-colors">{proj.name}</h3>
                              {isOwner && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => openModal('project', proj)} className="text-primary"><span className="material-symbols-outlined text-[14px]">edit</span></button>
                                  <button onClick={() => handleDeleteItem(`projects/${proj.projId}`)} className="text-red-400"><span className="material-symbols-outlined text-[14px]">delete</span></button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                              <span className="text-[11px] text-slate-400 font-medium">{proj.year}{proj.category ? ` · ${proj.category}` : ''}</span>
                              {proj.link && proj.link !== '#' && (
                                <a href={proj.link} target="_blank" rel="noreferrer" className="text-primary"><span className="material-symbols-outlined text-[16px]">open_in_new</span></a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{isOwner ? 'Showcase your projects here.' : 'No projects added yet.'}</p>
                  )}
                </div>

                {/* Certifications */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Licenses & Certifications</h2>
                    {isOwner && (
                      <button onClick={() => openModal('certification')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                      </button>
                    )}
                  </div>
                  {profileData.certifications?.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.certifications.map(cert => (
                        <div key={cert.certId} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                          <div className="size-12 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm p-1.5">
                            {cert.logoUrl ? <img alt={cert.organization} className="w-full h-full object-contain" src={cert.logoUrl} crossOrigin="anonymous" /> : <span className="text-sm font-bold text-blue-600">{cert.organization?.substring(0, 3).toUpperCase()}</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cert.name}</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{cert.organization}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{cert.issueDate}{cert.expiryDate ? ` · Expires ${cert.expiryDate}` : ''}</p>
                              </div>
                              {isOwner && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => openModal('certification', cert)} className="text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                                  <button onClick={() => handleDeleteItem(`certifications/${cert.certId}`)} className="text-red-400"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                                </div>
                              )}
                            </div>
                            {cert.credentialUrl && (
                              <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition no-underline">
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                Show Credential
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{isOwner ? 'Add your certifications and licenses.' : 'No certifications yet.'}</p>
                  )}
                </div>
              </>
            )}

            {tab === 'posts' && <ProfilePosts userId={userId === 'me' ? profileData?.userId : userId} token={token} isOwner={isOwner} profileData={profileData} />}
            {tab === 'activity' && <ProfileActivity userId={userId === 'me' ? profileData?.userId : userId} token={token} isOwner={isOwner} profileData={profileData} />}

          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
