import React from 'react';

function App() {
  return (
    <div className="font-display antialiased selection:bg-primary/20 selection:text-primary-dark">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="bubble bubble-lavender animate-drift size-[500px] -top-20 -left-20 animate-float"></div>
        <div className="bubble bubble-peach animate-drift-slow size-[600px] top-1/4 -right-40 animate-float-delayed"></div>
        <div className="bubble bubble-pink animate-drift-delayed size-[400px] bottom-1/4 left-1/3 animate-float-slow"></div>
        <div className="bubble bubble-blue animate-drift size-[550px] -bottom-20 right-1/4 animate-float-reverse"></div>
      </div>
      <div className="relative flex min-h-screen w-full flex-col z-10">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 glass-nav px-6 py-4">
          <div className="mx-auto max-w-[1280px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-2xl">diamond</span>
              </div>
              <h2 className="text-[#2d3748] text-xl font-bold tracking-tight">
                Otomate<span className="font-light text-primary">Careers</span>
              </h2>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-[#4a5568] hover:text-primary text-sm font-medium transition-colors" href="#">Find Jobs</a>
              <a className="text-[#4a5568] hover:text-primary text-sm font-medium transition-colors" href="#">Companies</a>
              <a className="text-[#4a5568] hover:text-primary text-sm font-medium transition-colors" href="#">Salaries</a>
              <a className="text-[#4a5568] hover:text-primary text-sm font-medium transition-colors" href="#">Advice</a>
            </nav>
            <div className="flex gap-3">
              <button className="hidden sm:flex items-center justify-center rounded-xl h-10 px-6 bg-transparent border border-gray-200 hover:border-primary text-[#2d3748] text-sm font-semibold transition-all hover:bg-white hover:text-primary">
                Sign In
              </button>
              <button className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 text-sm font-bold transition-all transform hover:scale-[1.05] hover:shadow-primary/40">
                Join Now
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow pt-24 md:pt-32">
          <section className="relative px-6 pb-20 overflow-visible">
            <div className="relative z-10 max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="flex flex-col items-start text-left">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-primary/20 shadow-sm backdrop-blur-sm animate-float load-fade-in-up">
                  <span className="size-2 rounded-full bg-pastel-pink animate-pulse"></span>
                  <span className="text-xs font-bold text-primary-dark uppercase tracking-wide">The premier career network</span>
                </div>
                <h1 className="load-slide-in-left delay-100 text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#2d3748] mb-6 leading-[1.1]">
                  Discover a Career <br /><span className="text-gradient font-light italic">As Unique As You</span>
                </h1>
                <p className="load-slide-in-left delay-200 text-lg md:text-xl text-[#4a5568] max-w-xl mb-10 font-light leading-relaxed">
                  Connect with premium employers in a space designed for professionals who value culture, growth, and vibrancy.
                </p>
                <div className="w-full p-2 bg-white/80 rounded-2xl shadow-card border border-white relative z-20 backdrop-blur-md transition-all hover:shadow-soft load-fade-in-up delay-300">
                  <form className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex-1 flex items-center px-4 w-full h-12 sm:h-14">
                      <span className="material-symbols-outlined text-primary mr-3">search</span>
                      <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#2d3748] placeholder-gray-400 font-medium outline-none" placeholder="Job title, keywords..." type="text" />
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                    <div className="flex-1 flex items-center px-4 w-full h-12 sm:h-14 border-t sm:border-t-0 border-gray-100">
                      <span className="material-symbols-outlined text-primary mr-3">location_on</span>
                      <input className="w-full bg-transparent border-none focus:ring-0 p-0 text-[#2d3748] placeholder-gray-400 font-medium outline-none" placeholder="City, state..." type="text" />
                    </div>
                    <button className="w-full sm:w-auto min-w-[120px] h-12 sm:h-14 bg-[#2d3748] hover:bg-primary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/30" type="button">
                      <span>Search</span>
                    </button>
                  </form>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#718096] load-fade-in-up delay-300">
                  <span className="font-medium">Trending:</span>
                  <a className="hover:text-primary transition-colors underline decoration-dotted" href="#">UX Design</a>
                  <a className="hover:text-primary transition-colors underline decoration-dotted" href="#">Marketing Lead</a>
                  <a className="hover:text-primary transition-colors underline decoration-dotted" href="#">Data Science</a>
                </div>
              </div>
              <div className="relative h-[500px] lg:h-[600px] w-full hidden lg:block perspective-[1000px] load-fade-in-up delay-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-96 h-96 bg-pastel-lavender/20 rounded-full blur-3xl animate-float-slow -z-10"></div>
                  <div className="relative z-20 w-80 bg-white/70 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-float animate-float transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-700">
                    <div className="flex items-center justify-between mb-6">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-pastel-lavender flex items-center justify-center text-white shadow-lg">
                        <span className="material-symbols-outlined text-2xl">diamond</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">New Match</div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="h-4 w-3/4 bg-gray-200 rounded-full"></div>
                      <div className="h-3 w-1/2 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <div className="h-10 flex-1 bg-gray-100 rounded-xl"></div>
                      <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-sm">bookmark</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-20 left-10 z-30 bg-white p-4 rounded-2xl shadow-float animate-float-delayed backdrop-blur-sm border border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-pastel-peach/30 flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined">rocket_launch</span>
                      </div>
                      <div className="text-xs font-bold text-gray-600">
                        <span className="block text-gray-800 text-sm">Growth</span>
                        High potential
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-32 -right-4 z-30 bg-white p-4 rounded-2xl shadow-float animate-float-reverse backdrop-blur-sm border border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-secondary/30 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">public</span>
                      </div>
                      <div className="text-xs font-bold text-gray-600">
                        <span className="block text-gray-800 text-sm">Remote</span>
                        Work anywhere
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-10 right-20 text-pastel-pink animate-float-slow text-6xl opacity-80" style={{ textShadow: '0 10px 20px rgba(251, 162, 208, 0.4)' }}>
                    ✦
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-12 px-6">
            <div className="max-w-[1280px] mx-auto">
              <h3 className="text-center text-[#2d3748] text-xl font-bold mb-12 scroll-reveal">Explore Opportunities by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <a className="scroll-reveal stagger-1 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/50 hover:shadow-soft transition-all duration-300 backdrop-blur-sm hover:-translate-y-2" href="#">
                  <div className="size-16 rounded-2xl bg-pastel-lavender/20 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors animate-float">
                    <span className="material-symbols-outlined text-3xl">palette</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">Design</span>
                </a>
                <a className="scroll-reveal stagger-2 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/50 hover:shadow-soft transition-all duration-300 backdrop-blur-sm hover:-translate-y-2" href="#">
                  <div className="size-16 rounded-2xl bg-secondary/20 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors animate-float-delayed">
                    <span className="material-symbols-outlined text-3xl">code</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">Engineering</span>
                </a>
                <a className="scroll-reveal stagger-3 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/50 hover:shadow-soft transition-all duration-300 backdrop-blur-sm hover:-translate-y-2" href="#">
                  <div className="size-16 rounded-2xl bg-pastel-peach/20 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors animate-float-reverse">
                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">Finance</span>
                </a>
                <a className="scroll-reveal stagger-4 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/50 hover:shadow-soft transition-all duration-300 backdrop-blur-sm hover:-translate-y-2" href="#">
                  <div className="size-16 rounded-2xl bg-pastel-pink/20 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors animate-float">
                    <span className="material-symbols-outlined text-3xl">campaign</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">Marketing</span>
                </a>
                <a className="scroll-reveal stagger-5 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/50 hover:shadow-soft transition-all duration-300 backdrop-blur-sm hover:-translate-y-2" href="#">
                  <div className="size-16 rounded-2xl bg-pastel-lavender/20 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors animate-float-delayed">
                    <span className="material-symbols-outlined text-3xl">health_and_safety</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">Health</span>
                </a>
                <a className="scroll-reveal stagger-6 group flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/60 border border-secondary/20 hover:border-primary/10 transition-colors hover:-translate-y-2 shadow-sm" href="#">
                  <div className="size-16 rounded-2xl bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                    <span className="material-symbols-outlined text-3xl">more_horiz</span>
                  </div>
                  <span className="font-bold text-[#2d3748] text-sm">More</span>
                </a>
              </div>
            </div>
          </section>
          {/* Updated Section: Featured Opportunities with Background Animation */}
          <section className="py-24 px-6 bg-white/10 backdrop-blur-md relative overflow-hidden">
            {/* Animated Background Container */}
            <div className="absolute inset-0 z-0 flex pointer-events-none">
              {/* Left Side */}
              <div className="relative flex-1 h-full animate-expand-left">
                <div className="absolute inset-0 bg-pastel-lavender/10 shape-trapezoid"></div>
                <div className="absolute top-0 right-0 w-full h-32 bg-secondary shape-hat-top opacity-30"></div>
                <div className="absolute bottom-0 right-0 w-full h-32 bg-pastel-peach shape-hat-bottom opacity-30"></div>
              </div>
              {/* Right Side */}
              <div className="relative flex-1 h-full animate-expand-right">
                <div className="absolute inset-0 bg-pastel-lavender/10 shape-trapezoid" style={{ transform: 'scaleX(-1)' }}></div>
                <div className="absolute top-0 left-0 w-full h-32 bg-pastel-pink shape-hat-top opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-pastel-lavender shape-hat-bottom opacity-30"></div>
              </div>
            </div>
            <div className="max-w-[1280px] mx-auto relative z-10">
              <div className="flex items-end justify-between mb-16 px-2 card-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="scroll-reveal-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#2d3748] tracking-tight">Featured Opportunities</h2>
                  <p className="text-[#718096] mt-3 font-light text-lg">Hand-picked roles for top tier professionals</p>
                </div>
                <a className="hidden sm:flex items-center text-primary font-bold text-sm hover:underline scroll-reveal" href="#">
                  View all jobs <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Job Card 1 */}
                <div className="card-reveal group relative bg-white rounded-3xl overflow-hidden border border-secondary/20 shadow-sm card-hover-effect" style={{ animationDelay: '0.2s' }}>
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-xs font-bold text-[#2d3748]">Full-time</div>
                  </div>
                  <div className="p-8 pt-10 relative">
                    <div className="absolute -top-10 left-8 size-20 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="size-full rounded-xl bg-pastel-lavender/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary">design_services</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2d3748] mb-1 group-hover:text-primary transition-colors">Senior UX Designer</h3>
                    <p className="text-[#718096] text-sm font-medium mb-5">Creative Studio • Remote</p>
                    <div className="flex flex-wrap gap-2 mb-8 scroll-reveal-late">
                      <span className="px-3 py-1.5 rounded-lg bg-pastel-lavender/10 text-primary-dark text-xs font-bold">Design</span>
                      <span className="px-3 py-1.5 rounded-lg bg-pastel-lavender/10 text-primary-dark text-xs font-bold">Senior</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-5 scroll-reveal-late">
                      <span className="text-[#2d3748] font-bold text-base">$120k - $150k</span>
                      <span className="text-[#a0aec0] text-xs font-medium">Posted 2d ago</span>
                    </div>
                  </div>
                </div>
                {/* Job Card 2 */}
                <div className="card-reveal group relative bg-white rounded-3xl overflow-hidden border border-secondary/20 shadow-sm card-hover-effect lg:translate-y-12" style={{ animationDelay: '0.3s' }}>
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-xs font-bold text-[#2d3748]">Hybrid</div>
                  </div>
                  <div className="p-8 pt-10 relative">
                    <div className="absolute -top-10 left-8 size-20 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="size-full rounded-xl bg-pastel-pink/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary">storefront</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2d3748] mb-1 group-hover:text-primary transition-colors">Marketing Manager</h3>
                    <p className="text-[#718096] text-sm font-medium mb-5">TechFlow Inc. • New York, NY</p>
                    <div className="flex flex-wrap gap-2 mb-8 scroll-reveal-late">
                      <span className="px-3 py-1.5 rounded-lg bg-pastel-pink/10 text-primary-dark text-xs font-bold">Marketing</span>
                      <span className="px-3 py-1.5 rounded-lg bg-pastel-pink/10 text-primary-dark text-xs font-bold">Mid-Level</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-5 scroll-reveal-late">
                      <span className="text-[#2d3748] font-bold text-base">$90k - $120k</span>
                      <span className="text-[#a0aec0] text-xs font-medium">Posted 5h ago</span>
                    </div>
                  </div>
                </div>
                {/* Job Card 3 */}
                <div className="card-reveal group relative bg-white rounded-3xl overflow-hidden border border-secondary/20 shadow-sm card-hover-effect" style={{ animationDelay: '0.4s' }}>
                  <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-1 text-xs font-bold text-[#2d3748]">Contract</div>
                  </div>
                  <div className="p-8 pt-10 relative">
                    <div className="absolute -top-10 left-8 size-20 rounded-2xl bg-white shadow-lg p-1.5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="size-full rounded-xl bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary">terminal</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-[#2d3748] mb-1 group-hover:text-primary transition-colors">Frontend Developer</h3>
                    <p className="text-[#718096] text-sm font-medium mb-5">WebSolutions • London, UK</p>
                    <div className="flex flex-wrap gap-2 mb-8 scroll-reveal-late">
                      <span className="px-3 py-1.5 rounded-lg bg-secondary/10 text-primary-dark text-xs font-bold">Engineering</span>
                      <span className="px-3 py-1.5 rounded-lg bg-secondary/10 text-primary-dark text-xs font-bold">React</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-5 scroll-reveal-late">
                      <span className="text-[#2d3748] font-bold text-base">£60k - £80k</span>
                      <span className="text-[#a0aec0] text-xs font-medium">Posted 1d ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="py-24 px-6 mt-12">
            <div className="max-w-[1280px] mx-auto relative rounded-3xl overflow-hidden bg-primary text-white shadow-2xl shadow-primary/30 transform hover:scale-[1.01] transition-transform duration-500 scroll-reveal">
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')]" style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-pastel-lavender/50"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-12 md:p-20 gap-10">
                <div className="max-w-xl">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display scroll-reveal-left">Your next chapter begins here.</h2>
                  <p className="text-white/90 text-lg mb-10 font-light leading-relaxed scroll-reveal-left stagger-1">Join a community where talent meets opportunity in an environment crafted for success.</p>
                  <div className="flex flex-col sm:flex-row gap-4 scroll-reveal-late">
                    <button className="flex items-center justify-center rounded-xl h-14 px-10 bg-white text-primary hover:bg-white/90 font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                      Create your Profile
                    </button>
                    <button className="flex items-center justify-center rounded-xl h-14 px-10 bg-transparent border border-white/40 text-white hover:bg-white/10 font-medium transition-all hover:-translate-y-1">
                      Learn More
                    </button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="size-64 rounded-3xl border border-white/20 flex items-center justify-center relative bg-white/5 backdrop-blur-sm animate-float">
                    <div className="absolute inset-0 rounded-3xl border border-white/10 animate-pulse"></div>
                    <span className="material-symbols-outlined text-9xl text-white opacity-90 drop-shadow-2xl">auto_awesome</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <footer className="bg-white border-t border-secondary/20 pt-20 pb-10 px-6 mt-12">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-1 scroll-reveal-late stagger-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-lg">diamond</span>
                  </div>
                  <span className="text-[#2d3748] font-bold text-xl">Otomate Careers</span>
                </div>
                <p className="text-[#718096] text-sm leading-relaxed mb-6">
                  Elevating recruitment to an art form. We connect exceptional talent with visionary companies.
                </p>
                <div className="flex gap-4">
                  <a className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-[#2d3748] hover:bg-primary hover:text-white transition-all hover:-translate-y-1" href="#">
                    <span className="material-symbols-outlined text-sm">alternate_email</span>
                  </a>
                  <a className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center text-[#2d3748] hover:bg-primary hover:text-white transition-all hover:-translate-y-1" href="#">
                    <span className="material-symbols-outlined text-sm">public</span>
                  </a>
                </div>
              </div>
              <div className="scroll-reveal-late stagger-2">
                <h4 className="font-bold text-[#2d3748] mb-6">For Candidates</h4>
                <ul className="flex flex-col gap-4 text-sm text-[#4a5568]">
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Browse Jobs</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Career Advice</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Salary Guide</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Candidate Login</a></li>
                </ul>
              </div>
              <div className="scroll-reveal-late stagger-3">
                <h4 className="font-bold text-[#2d3748] mb-6">For Employers</h4>
                <ul className="flex flex-col gap-4 text-sm text-[#4a5568]">
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Post a Job</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Talent Solutions</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
                  <li className="hover:translate-x-1 transition-transform"><a className="hover:text-primary transition-colors" href="#">Employer Login</a></li>
                </ul>
              </div>
              <div className="scroll-reveal-late stagger-4">
                <h4 className="font-bold text-[#2d3748] mb-6">Stay Connected</h4>
                <p className="text-[#718096] text-sm mb-4">Subscribe to our newsletter for the latest opportunities.</p>
                <form className="flex gap-2">
                  <input className="flex-1 rounded-xl border-gray-200 bg-secondary/5 text-sm focus:border-primary focus:ring-0 outline-none p-2" placeholder="Email address" type="email" />
                  <button className="bg-primary text-white rounded-xl px-4 hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5" type="button">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </form>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 scroll-reveal-late">
              <p className="text-xs text-[#a0aec0]">© 2023 Otomate Careers. All rights reserved.</p>
              <div className="flex gap-6 text-xs text-[#a0aec0]">
                <a className="hover:text-[#2d3748]" href="#">Privacy Policy</a>
                <a className="hover:text-[#2d3748]" href="#">Terms of Service</a>
                <a className="hover:text-[#2d3748]" href="#">Cookie Settings</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
