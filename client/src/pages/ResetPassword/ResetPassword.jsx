import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/reset-password/success');
      } else {
        setError(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-text-main dark:text-white relative overflow-x-hidden selection:bg-primary/30 font-display">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <header className="w-full flex items-center justify-between px-8 py-6 max-w-[1440px] mx-auto z-10">
        <div className="flex items-center gap-3 text-text-main dark:text-white">
        <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-2xl">diamond</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Korra</h2>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium font-sans text-text-muted dark:text-gray-400">
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-[1440px] mx-auto">
        <div className="w-full max-w-md mx-auto relative z-10">
          <div className="bg-white dark:bg-[#1A1D2D] rounded-xl shadow-soft dark:shadow-none border border-white/50 dark:border-white/5 p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-glow transition-shadow duration-300">
            <div className="w-16 h-16 bg-rose-gold/20 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6 text-rose-500 dark:text-rose-300">
              <span className="material-symbols-outlined text-3xl">encrypted</span>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-text-main dark:text-white">Set new password</h1>
            <p className="text-text-muted dark:text-gray-400 text-sm mb-8 leading-relaxed font-sans max-w-xs">
              Your new password must be different from previously used passwords.
            </p>

            {error && <div className="text-red-500 text-sm mb-4 font-sans">{error}</div>}

            <form className="w-full flex flex-col gap-5 text-left" onSubmit={handleSubmit}>
              <label className="flex flex-col w-full group/input">
                <span className="text-xs font-semibold text-text-main dark:text-gray-300 mb-2 ml-1 font-sans">New Password</span>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#121420] text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-sans placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </label>

              <div className="flex flex-col gap-1.5 w-full">
                <div className="flex gap-2 w-full h-1.5">
                  <div className={`h-full w-1/4 rounded-full ${password.length > 0 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <div className={`h-full w-1/4 rounded-full ${password.length >= 4 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <div className={`h-full w-1/4 rounded-full ${password.length >= 8 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                  <div className={`h-full w-1/4 rounded-full ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] text-text-muted dark:text-gray-500 font-sans">Min 8 characters</span>
                  {password.length >= 8 && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide font-sans">Strong</span>}
                </div>
              </div>

              <label className="flex flex-col w-full group/input">
                <span className="text-xs font-semibold text-text-main dark:text-gray-300 mb-2 ml-1 font-sans">Confirm Password</span>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#121420] text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-sans placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] font-sans flex items-center justify-center disabled:opacity-70"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <Link to="/login" className="mt-8 text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium flex items-center gap-1 transition-colors font-sans group/link">
              <span className="material-symbols-outlined text-base transition-transform group-hover/link:-translate-x-1">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-xs text-text-muted/60 font-sans">
        <p>© 2024 Korra Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ResetPassword;
