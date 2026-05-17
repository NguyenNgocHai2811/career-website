import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader.jsx';
import {
  changePassword,
  deactivateAccount,
  getAccount,
  requestEmailVerification,
  updateAccount,
  updateEmail,
  updateNotificationPreferences,
  verifyEmail,
} from '../../services/accountService.js';

const DEFAULT_PREFS = {
  email: true,
  push: true,
  jobAlerts: true,
  messages: true,
};

const mergeLocalUser = (patch) => {
  const current = JSON.parse(localStorage.getItem('user') || '{}');
  const next = { ...current, ...patch };
  localStorage.setItem('user', JSON.stringify(next));
  return next;
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</span>
    <div className="mt-1.5">{children}</div>
  </label>
);

const TextInput = (props) => (
  <input
    {...props}
    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
  />
);

const Section = ({ title, subtitle, icon, children }) => (
  <section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
    <div className="flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-950 dark:text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Alert = ({ notice }) => {
  if (!notice) return null;
  const tone = notice.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${tone}`}>
      {notice.text}
    </div>
  );
};

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const verificationToken = useMemo(() => new URLSearchParams(location.search).get('verifyEmailToken'), [location.search]);

  const [account, setAccount] = useState(null);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', address: '', dateOfBirth: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [dangerForm, setDangerForm] = useState({ currentPassword: '', confirmation: '' });
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [verificationOnly, setVerificationOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const runVerification = async () => {
      if (!verificationToken) return false;
      try {
        const result = await verifyEmail(verificationToken);
        if (cancelled) return true;
        setNotice({ type: 'success', text: 'Email verified successfully.' });
        if (result.tokenUser && token) mergeLocalUser(result.tokenUser);
        if (result.data) {
          setAccount(result.data);
          setPrefs(result.data.notificationPreferences || DEFAULT_PREFS);
        }
        navigate('/settings', { replace: true });
      } catch (err) {
        if (!cancelled) setNotice({ type: 'error', text: err.message });
      }
      return true;
    };

    const load = async () => {
      setLoading(true);
      const verifiedOnly = await runVerification();
      if (!token) {
        setVerificationOnly(verifiedOnly);
        setLoading(false);
        if (!verifiedOnly) navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await getAccount(token);
        if (cancelled) return;
        setAccount(data);
        setProfileForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          dateOfBirth: data.dateOfBirth || '',
        });
        setEmailForm({ newEmail: data.email || '', currentPassword: '' });
        setPrefs(data.notificationPreferences || DEFAULT_PREFS);
      } catch (err) {
        if (!cancelled) setNotice({ type: 'error', text: err.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [navigate, token, verificationToken]);

  const runAction = async (key, action, successText) => {
    setSavingKey(key);
    setNotice(null);
    try {
      const result = await action();
      setNotice({ type: 'success', text: successText });
      return result;
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
      return null;
    } finally {
      setSavingKey('');
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const updated = await runAction('profile', () => updateAccount(token, profileForm), 'Account details updated.');
    if (updated) {
      setAccount(updated);
      mergeLocalUser({
        fullName: updated.fullName,
        phone: updated.phone,
        dateOfBirth: updated.dateOfBirth,
        address: updated.address,
      });
    }
  };

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    const result = await runAction('email', () => updateEmail(token, emailForm), 'Email updated. Check your inbox to verify it.');
    if (result?.data) {
      setAccount(result.data);
      setEmailForm({ newEmail: result.data.email || '', currentPassword: '' });
      mergeLocalUser(result.tokenUser || { email: result.data.email, emailVerified: result.data.emailVerified });
      if (result.verificationSent === false) {
        setNotice({ type: 'error', text: 'Email changed, but the verification email could not be sent.' });
      }
    }
  };

  const handleResendVerification = async () => {
    const result = await runAction('verify', () => requestEmailVerification(token), 'Verification email sent.');
    if (result?.alreadyVerified) {
      setNotice({ type: 'success', text: 'This email is already verified.' });
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const result = await runAction('password', () => changePassword(token, passwordForm), 'Password updated.');
    if (result) setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handlePrefsSubmit = async (event) => {
    event.preventDefault();
    const updated = await runAction('prefs', () => updateNotificationPreferences(token, prefs), 'Notification preferences saved.');
    if (updated) setPrefs(updated);
  };

  const handleDeactivate = async (event) => {
    event.preventDefault();
    const result = await runAction('danger', () => deactivateAccount(token, dangerForm), 'Account deactivated.');
    if (result) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader />
        <div className="flex items-center justify-center py-24">
          <div className="size-9 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (verificationOnly && !token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-12">
          <Alert notice={notice} />
          <Link to="/login" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white no-underline">
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Account</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight">Settings</h1>
          </div>
          {account?.email && (
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${account.emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {account.emailVerified ? 'Email verified' : 'Email not verified'}
            </span>
          )}
        </div>

        <div className="mb-5">
          <Alert notice={notice} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Section title="Profile details" subtitle="Keep your account contact information current." icon="manage_accounts">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Field label="Full name">
                <TextInput value={profileForm.fullName} onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone">
                  <TextInput value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                </Field>
                <Field label="Date of birth">
                  <TextInput type="date" value={profileForm.dateOfBirth || ''} onChange={e => setProfileForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
                </Field>
              </div>
              <Field label="Address">
                <TextInput value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} />
              </Field>
              <button disabled={savingKey === 'profile'} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {savingKey === 'profile' ? 'Saving...' : 'Save account'}
              </button>
            </form>
          </Section>

          <Section title="Email" subtitle="Changing email requires your current password." icon="alternate_email">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Field label="Email address">
                <TextInput type="email" value={emailForm.newEmail} onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))} required />
              </Field>
              <Field label="Current password">
                <TextInput type="password" value={emailForm.currentPassword} onChange={e => setEmailForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button disabled={savingKey === 'email'} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                  {savingKey === 'email' ? 'Saving...' : 'Update email'}
                </button>
                {!account?.emailVerified && (
                  <button type="button" onClick={handleResendVerification} disabled={savingKey === 'verify'} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    {savingKey === 'verify' ? 'Sending...' : 'Resend verification'}
                  </button>
                )}
              </div>
            </form>
          </Section>

          <Section title="Password" subtitle="Use at least 8 characters for the new password." icon="lock_reset">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Field label="Current password">
                <TextInput type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </Field>
              <Field label="New password">
                <TextInput type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required minLength={8} />
              </Field>
              <Field label="Confirm new password">
                <TextInput type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} required minLength={8} />
              </Field>
              <button disabled={savingKey === 'password'} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {savingKey === 'password' ? 'Saving...' : 'Change password'}
              </button>
            </form>
          </Section>

          <Section title="Notifications" subtitle="Choose which account events should reach you." icon="notifications">
            <form onSubmit={handlePrefsSubmit} className="space-y-3">
              {[
                ['email', 'Email notifications'],
                ['push', 'In-app notifications'],
                ['jobAlerts', 'Job alerts'],
                ['messages', 'Message alerts'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-3 text-sm font-semibold dark:border-slate-800">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                    className="size-4 accent-primary"
                  />
                </label>
              ))}
              <button disabled={savingKey === 'prefs'} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {savingKey === 'prefs' ? 'Saving...' : 'Save notifications'}
              </button>
            </form>
          </Section>

          <section className="rounded-lg border border-red-200 bg-white dark:border-red-900/60 dark:bg-slate-950 lg:col-span-2">
            <div className="flex items-start gap-3 border-b border-red-100 px-5 py-4 dark:border-red-900/40">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-red-700 dark:text-red-300">Deactivate account</h2>
                <p className="mt-0.5 text-sm text-red-500 dark:text-red-300/80">This signs you out and blocks future access until an admin restores the account.</p>
              </div>
            </div>
            <form onSubmit={handleDeactivate} className="grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Current password">
                <TextInput type="password" value={dangerForm.currentPassword} onChange={e => setDangerForm(f => ({ ...f, currentPassword: e.target.value }))} required />
              </Field>
              <Field label="Type DEACTIVATE">
                <TextInput value={dangerForm.confirmation} onChange={e => setDangerForm(f => ({ ...f, confirmation: e.target.value }))} required />
              </Field>
              <button disabled={savingKey === 'danger'} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                {savingKey === 'danger' ? 'Working...' : 'Deactivate'}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
