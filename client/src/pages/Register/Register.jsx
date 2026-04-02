import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [role, setRole] = useState('candidate');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role.toUpperCase(),
          fullName,
          email,
          password,
          confirmPassword,
          phone,
          dateOfBirth,
          address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('A network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light font-display text-[#0f111a] dark:text-white min-h-screen">
      <div className="bubble-bg">
        <div className="bubble bg-pastel-blue w-[400px] h-[400px] top-[-100px] left-[-50px]"></div>
        <div className="bubble bg-pastel-peach w-[500px] h-[500px] bottom-[-150px] right-[-100px]"></div>
        <div className="bubble bg-pastel-pink w-[350px] h-[350px] top-[20%] right-[10%]"></div>
        <div className="bubble bg-pastel-purple w-[450px] h-[450px] bottom-[10%] left-[15%]"></div>
      </div>
      <div className="relative flex min-h-screen w-full flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8eaf2] dark:border-b-white/10 px-10 py-3 bg-white/70 dark:bg-background-dark/70 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4 text-[#0f111a] dark:text-white">
            <div className="size-6 text-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Korra</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Network</a>
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Jobs</a>
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Recruiters</a>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
              <span className="truncate"><Link to="/login">
                              Log in
                            </Link></span>
            </button>
          </div>
        </header>
        <main className="flex flex-1 justify-center items-center py-8 px-4">
          <div className="layout-content-container flex flex-col w-full max-w-[720px] bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden">
            <div className="flex flex-col gap-2 p-8 pb-4 border-b border-[#e8eaf2] dark:border-b-white/10">
              <h1 className="text-[#0f111a] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Join the Network</h1>
              <p className="text-[#545d92] dark:text-slate-400 text-sm font-normal">Complete your registration to get started.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-8">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Choose Your Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${role === 'candidate' ? 'border-primary bg-primary/5' : 'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50'}`}
                  >
                    <input checked={role === 'candidate'} onChange={() => setRole('candidate')} className="sr-only" name="role" type="radio" value="candidate" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === 'candidate' ? 'bg-primary text-white' : 'bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white'}`}>
                          <span className="material-symbols-outlined text-xl">person_search</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f111a] dark:text-white">Candidate</p>
                          <p className="text-xs text-[#545d92] dark:text-slate-400">Looking for jobs</p>
                        </div>
                      </div>
                      <div className={role === 'candidate' ? 'text-primary' : 'text-transparent'}>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    </div>
                  </label>
                  <label
                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${role === 'recruiter' ? 'border-primary bg-primary/5' : 'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50'}`}
                  >
                    <input checked={role === 'recruiter'} onChange={() => setRole('recruiter')} className="sr-only" name="role" type="radio" value="recruiter" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === 'recruiter' ? 'bg-primary text-white' : 'bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white'}`}>
                          <span className="material-symbols-outlined text-xl">badge</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f111a] dark:text-white">Recruiter</p>
                          <p className="text-xs text-[#545d92] dark:text-slate-400">Hiring talent</p>
                        </div>
                      </div>
                      <div className={role === 'recruiter' ? 'text-primary' : 'text-transparent'}>
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    </div>
                  </label>
                </div>
              </section>
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Account Basics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Full Name</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Jane Doe" type="text" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Email Address</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input required value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="jane@example.com" type="email" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Password</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input required value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Min. 8 characters" type={showPassword ? "text" : "password"} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center pr-3 text-primary">
                        <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Confirm Password</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Re-enter password" type={showConfirmPassword ? "text" : "password"} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="flex items-center pr-3 text-primary hover:text-primary">
                        <span className="material-symbols-outlined text-lg">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Contact &amp; Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Phone Number</p>
                    <div className="flex gap-2">
                      <select className="w-24 rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 px-2 py-2.5 outline-none focus:border-primary text-xs text-[#0f111a] dark:text-white">
                        <option>Mobile</option>
                        <option>Home</option>
                        <option>Work</option>
                      </select>
                      <div className="flex-1 flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" placeholder="+1 (555) 000-0000" type="tel" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Date of Birth</p>
                    <div className="relative flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all overflow-hidden">
                      <input
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="relative z-10 w-full bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer bg-transparent"
                        type="date"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#545d92] pointer-events-none z-0">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Mailing Address</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input value={address} onChange={(e) => setAddress(e.target.value)} className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" placeholder="Street address, City, Country" type="text" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="pt-6 border-t border-[#e8eaf2] dark:border-white/10 flex flex-col gap-4">
                <button disabled={isLoading} type="submit" className="w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-base font-bold shadow-lg hover:shadow-primary/30 hover:translate-y-[-1px] transition-all disabled:opacity-50">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <p className="text-center text-xs text-[#545d92] dark:text-slate-400">
                  By clicking "Create Account", you agree to our <a className="text-primary font-bold underline" href="#">Terms of Service</a> and <a className="text-primary font-bold underline" href="#">Privacy Policy</a>.
                </p>
                <p className="text-center text-sm font-medium text-[#0f111a] dark:text-white mt-2">
                  Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in here</Link>
                </p>
              </div>
            </form>
          </div>
        </main>
        <footer className="py-6 text-center text-[#545d92] dark:text-slate-400 text-xs">
          © 2023 NetworkPortal Inc. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
export default Register;