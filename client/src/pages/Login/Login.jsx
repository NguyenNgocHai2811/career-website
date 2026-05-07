import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormInput, Button, ErrorAlert, BackgroundBlobs } from '../../components';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle success
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        if (data.data.user.isOnboarded === false) {
          navigate('/onboarding');
        } else if (data.data.user.role === 'RECRUITER') {
          navigate('/recruiter');
        } else {
          navigate('/feed');
        }
      } else {
        // Handle API errors
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      // Handle network errors
      console.error('Login error:', err);
      setError('A network error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-display bg-[#F8FAFF] text-slate-900 antialiased overflow-x-hidden min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden">
        {/* Background Bubbles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <BackgroundBlobs blobs={[
            { position: "top-[-100px] left-[-50px]", size: "w-[500px] h-[500px]", color: "bg-pastel-blue" },
            { position: "top-1/4 right-[-100px]", size: "w-[400px] h-[400px]", color: "bg-pastel-pink" },
            { position: "bottom-[-150px] left-1/4", size: "w-[450px] h-[450px]", color: "bg-pastel-peach" },
            { position: "top-1/2 right-1/4", size: "w-[350px] h-[350px]", color: "bg-pastel-lavender" }
          ]} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[460px] overflow-hidden rounded-[10px] bg-white/95 backdrop-blur-sm shadow-2xl ring-1 ring-white/50">
            <div className="flex flex-col gap-2 p-10 pb-4 text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">diamond</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-primary-dark">Welcome Back</h2>
              <p className="text-sm text-slate-500">Access your professional networking dashboard.</p>
            </div>

            <div className="p-10 pt-4">
              {error && <ErrorAlert message={error} />}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  icon="mail"
                />

                <FormInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  showPasswordToggle
                />

                <div className="flex justify-end mt-1">
                  <a href="/forgot-password" className="text-xs font-bold text-primary hover:text-primary-hover hover:underline decoration-2 underline-offset-2 transition-all">Forgot Password?</a>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  loading={isLoading}
                  icon="arrow_forward"
                  iconPosition="right"
                  className="w-full"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                
              </form>

              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <a href="#" className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-primary/30">
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.2833 0 4.2.8333 5.6667 2.2l-1.8 1.8c-.85-.8167-1.95-1.45-3.8667-1.45-3.3 0-5.9833 2.7-5.9833 6s2.6833 6 5.9833 6c2.95 0 4.4833-1.6333 4.9667-3.8333h-4.9667v-2.55h7.5333c.1167.65.1833 1.25.1833 2.05 0 4.8833-3.2666 8.6833-7.7166 8.6833z" fill="currentColor"></path>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </a>
                <a href="#" className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-3 py-3 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:ring-primary/30">
                  <svg className="h-5 w-5 text-[#0077b5]" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
              <p className="text-sm text-slate-500">
                New to the platform?{' '}
                <Link to="/register" className="font-bold text-primary transition-colors hover:text-primary-hover hover:underline">Create an account</Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-primary-dark transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-dark transition-colors">Terms</a>
            <a href="#" className="hover:text-primary-dark transition-colors">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
