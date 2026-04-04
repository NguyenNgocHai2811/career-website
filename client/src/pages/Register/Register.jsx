import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FormInput, Button, ErrorAlert, RadioButtonGroup, BackgroundBlobs, Header } from '../../components';

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
        navigate('/onboarding');
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
        <BackgroundBlobs blobs={[
          { position: "top-[-100px] left-[-50px]", size: "w-[400px] h-[400px]", color: "bg-pastel-blue" },
          { position: "bottom-[-150px] right-[-100px]", size: "w-[500px] h-[500px]", color: "bg-pastel-peach" },
          { position: "top-[20%] right-[10%]", size: "w-[350px] h-[350px]", color: "bg-pastel-pink" },
          { position: "bottom-[10%] left-[15%]", size: "w-[450px] h-[450px]", color: "bg-pastel-purple" }
        ]} />
      </div>
      <div className="relative flex min-h-screen w-full flex-col">
        <Header rightElement={
          <Link to="/login" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
            <span className="truncate">
              Sign up
            </span>


          </Link>
        } />
        <main className="flex flex-1 justify-center items-center py-8 px-4">
          <div className="layout-content-container flex flex-col w-full max-w-[720px] bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden">
            <div className="flex flex-col gap-2 p-8 pb-4 border-b border-[#e8eaf2] dark:border-b-white/10">
              <h1 className="text-[#0f111a] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Join the Network</h1>
              <p className="text-[#545d92] dark:text-slate-400 text-sm font-normal">Complete your registration to get started.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-8">
              {error && <ErrorAlert message={error} />}
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Choose Your Role</h2>
                <RadioButtonGroup
                  options={[
                    { id: 'candidate', title: 'Candidate', description: 'Looking for jobs', icon: 'person_search' },
                    { id: 'recruiter', title: 'Recruiter', description: 'Hiring talent', icon: 'badge' }
                  ]}
                  selectedValue={role}
                  onChange={setRole}
                  name="role"
                />
              </section>
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Account Basics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Full Name"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    icon="person"
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon="mail"
                  />
                  <FormInput
                    label="Password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    showPasswordToggle
                  />
                  <FormInput
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    showPasswordToggle
                  />
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
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                  loading={isLoading}
                  loadingText="Creating Account..."
                >
                  Create Account
                </Button>
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