import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CheckEmail = () => {
  const location = useLocation();
  const email = location.state?.email || 'your-email@example.com';

  const handleResend = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await fetch(`${API_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      alert('Recovery email resent!');
    } catch (err) {
      alert('An error occurred, please try again.');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-text-main dark:text-white relative overflow-x-hidden selection:bg-primary/30 font-display">
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

      <main className="flex-grow flex flex-col items-center justify-center p-6 pt-24 w-full max-w-[1440px] mx-auto relative z-10">
        <div className="w-full max-w-[440px]">
          <div className="bg-white dark:bg-[#1A1D2D] rounded-xl shadow-soft dark:shadow-none border border-white/50 dark:border-white/5 p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden group transition-shadow duration-300">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150 animate-pulse"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-primary/10 to-rose-200/30 dark:from-primary/20 dark:to-rose-900/20 rounded-xl rotate-3 flex items-center justify-center border border-white/40 dark:border-white/5 shadow-sm relative z-10 transition-transform duration-500 group-hover:rotate-6">
                <span className="material-symbols-outlined text-5xl text-primary -rotate-3 transition-transform duration-500 group-hover:-rotate-6">mark_email_unread</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-text-main dark:text-white">Check your mail</h1>
            <p className="text-text-muted dark:text-gray-400 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
              We have sent a password recover link to your email address:
              <span className="font-semibold text-text-main dark:text-white mt-2 block bg-primary/5 border border-primary/10 py-1.5 px-3 rounded-lg mx-auto w-fit">{email}</span>
            </p>
            <div className="w-full flex flex-col gap-4">
              <button onClick={() => window.open('https://mail.google.com', '_blank')} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
                <span>Open Email App</span>
                <span className="material-symbols-outlined text-xl">open_in_new</span>
              </button>
              <div className="text-sm text-text-muted dark:text-gray-500 mt-3">
                Did not receive the email? <br />
                <button onClick={handleResend} className="text-primary font-bold hover:text-primary-dark hover:underline mt-1 inline-flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer">
                  Click to resend
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 w-full flex justify-center">
              <Link to="/login" className="text-sm text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium flex items-center gap-2 transition-colors group/link">
                <span className="material-symbols-outlined text-lg transition-transform group-hover/link:-translate-x-1">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-xs text-text-muted/60 relative z-10">
        <p>© 2024 Korra Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CheckEmail;
