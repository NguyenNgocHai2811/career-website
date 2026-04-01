import React from 'react';

 function Register() {
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
            <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">NetworkPortal</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Network</a>
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Jobs</a>
              <a className="text-[#0f111a] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Recruiters</a>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
              <span className="truncate">Log in</span>
            </button>
          </div>
        </header>
        <main className="flex flex-1 justify-center items-center py-8 px-4">
          <div className="layout-content-container flex flex-col w-full max-w-[720px] bg-white dark:bg-background-dark rounded-xl shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden">
            <div className="flex flex-col gap-2 p-8 pb-4 border-b border-[#e8eaf2] dark:border-b-white/10">
              <h1 className="text-[#0f111a] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Join the Network</h1>
              <p className="text-[#545d92] dark:text-slate-400 text-sm font-normal">Complete your registration to get started.</p>
            </div>
            <div className="p-8 pt-6 space-y-8">
              <section>
                <h2 className="text-[#0f111a] dark:text-white text-lg font-bold leading-tight pb-4">Choose Your Role</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="relative flex cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4 focus:outline-none">
                    <input defaultChecked className="sr-only" name="role" type="radio" value="candidate" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                          <span className="material-symbols-outlined text-xl">person_search</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f111a] dark:text-white">Candidate</p>
                          <p className="text-xs text-[#545d92] dark:text-slate-400">Looking for jobs</p>
                        </div>
                      </div>
                      <div className="text-primary">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                      </div>
                    </div>
                  </label>
                  <label className="relative flex cursor-pointer rounded-lg border-2 border-[#d2d5e5] dark:border-white/10 bg-transparent p-4 focus:outline-none hover:border-primary/50 transition-all">
                    <input className="sr-only" name="role" type="radio" value="recruiter" />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white">
                          <span className="material-symbols-outlined text-xl">badge</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f111a] dark:text-white">Recruiter</p>
                          <p className="text-xs text-[#545d92] dark:text-slate-400">Hiring talent</p>
                        </div>
                      </div>
                      <div className="text-transparent">
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
                      <input className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Jane Doe" type="text" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Email Address</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="jane@example.com" type="email" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">mail</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Password</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Min. 8 characters" type="password" />
                      <button className="flex items-center pr-3 text-primary">
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Confirm Password</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input className="flex-1 rounded-lg bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white placeholder:text-[#545d92]" placeholder="Re-enter password" type="password" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">lock</span>
                      </div>
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
                        <input className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" placeholder="+1 (555) 000-0000" type="tel" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Date of Birth</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" type="date" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <p className="text-[#0f111a] dark:text-white text-sm font-medium">Mailing Address</p>
                    <div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">
                      <input className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" placeholder="Street address, City, Country" type="text" />
                      <div className="flex items-center pr-3 text-[#545d92]">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className="pt-6 border-t border-[#e8eaf2] dark:border-white/10 flex flex-col gap-4">
                <button className="w-full flex h-12 items-center justify-center rounded-lg bg-primary text-white text-base font-bold shadow-lg hover:shadow-primary/30 hover:translate-y-[-1px] transition-all">
                  Create Account
                </button>
                <p className="text-center text-xs text-[#545d92] dark:text-slate-400">
                  By clicking "Create Account", you agree to our <a className="text-primary font-bold underline" href="#">Terms of Service</a> and <a className="text-primary font-bold underline" href="#">Privacy Policy</a>.
                </p>
                <p className="text-center text-sm font-medium text-[#0f111a] dark:text-white mt-2">
                  Already have an account? <a className="text-primary font-bold hover:underline" href="#">Log in here</a>
                </p>
              </div>
            </div>
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