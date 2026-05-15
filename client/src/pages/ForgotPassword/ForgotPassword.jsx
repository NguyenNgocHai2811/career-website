import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Chuyển hướng sang trang Check Email và truyền email qua state
        navigate('/forgot-password/check-email', { state: { email } });
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-white relative overflow-x-hidden selection:bg-primary/30 font-display min-h-screen">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <header className="fixed top-0 w-full flex items-center justify-between px-8 py-4 z-50 backdrop-blur-sm bg-white/80 dark:bg-[#1e293b]/80 border-b border-gray-200/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-xl">diamond</span>
            </div>
            <h2 className="text-[#2d3748] dark:text-white text-lg font-bold tracking-tight">
              Korra<span className="font-light text-primary">Careers</span>
            </h2>
          </Link>
        </div>
      </header>

      <main className="w-full flex flex-col items-center">
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative pt-20">
          <div className="bg-white dark:bg-[#1A1D2D] rounded-xl shadow-soft dark:shadow-none border border-white/50 dark:border-white/5 p-8 sm:p-10 flex flex-col items-center text-center w-full max-w-[480px] relative overflow-hidden group hover:shadow-glow transition-shadow duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-text-main dark:text-white">Forgot Password?</h1>
            <p className="text-text-muted dark:text-gray-400 text-sm mb-8 leading-relaxed px-2">
              Enter the email associated with your account and we’ll send you a link to reset your password.
            </p>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col text-left w-full group/input">
                <span className="text-xs font-semibold text-text-main dark:text-gray-300 mb-2 ml-1">Email Address</span>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-500 text-xl pointer-events-none">mail</span>
                  <input
                    className="w-full pl-11 pr-4 py-3 rounded-lg border border-rose-gold/60 dark:border-gray-600 bg-white dark:bg-[#121420] text-text-main dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    placeholder="name@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </form>

            <Link to="/login" className="mt-8 text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium flex items-center gap-1 transition-colors group/link">
              <span className="material-symbols-outlined text-base transition-transform group-hover/link:-translate-x-1">arrow_back</span>
              Back to Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;
