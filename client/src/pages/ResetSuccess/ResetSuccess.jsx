import React from 'react';
import { Link } from 'react-router-dom';

const ResetSuccess = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col text-text-main dark:text-white relative overflow-x-hidden selection:bg-primary/30 font-display">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-rose-200/40 dark:bg-rose-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      <header className="w-full flex items-center justify-between px-8 py-6 max-w-[1440px] mx-auto z-10">
        <div className="flex items-center gap-3 text-text-main dark:text-white">
          <div className="size-8 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Otomate</h2>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium font-sans text-text-muted dark:text-gray-400">
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
          <a className="hover:text-primary transition-colors" href="#">Contact Support</a>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-6 w-full max-w-[1440px] mx-auto">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-[#1A1D2D] rounded-xl shadow-soft dark:shadow-2xl border border-white/50 dark:border-white/5 p-10 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-sm group hover:shadow-glow transition-all duration-500">
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <div className="absolute top-12 left-12 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="absolute top-24 right-20 w-3 h-3 bg-rose-400 rounded-full animate-bounce delay-100"></div>
              <div className="absolute bottom-24 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-700"></div>
              <div className="absolute top-1/4 left-3/4 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              <div className="absolute bottom-12 right-12 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-8 text-green-500 shadow-sm border border-green-100 dark:border-green-800/30">
              <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-text-main dark:text-white font-display">Password Reset</h1>
            <p className="text-text-muted dark:text-gray-400 text-base mb-10 leading-relaxed font-sans px-4">
              Your password has been successfully reset. You can now log in securely.
            </p>

            <Link to="/login" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-primary/30 transition-all transform active:scale-[0.98] font-sans text-lg flex items-center justify-center gap-2 group/btn">
              <span>Log In to Otomate</span>
              <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <a className="text-sm text-text-muted dark:text-gray-500 hover:text-primary transition-colors font-sans flex items-center justify-center gap-1.5 group" href="#">
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">support_agent</span>
              <span>Need help? Contact support</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center text-xs text-text-muted/60 font-sans z-10">
        <p>© 2024 Otomate Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ResetSuccess;
