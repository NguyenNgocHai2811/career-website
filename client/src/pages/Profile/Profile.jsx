import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Fallback to "me" or a mock ID if userId is undefined in the route
        const idToFetch = userId || 'mock_user_123';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/users/${idToFetch}/profile`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-red-500">Error: {error}</div>;
  }

  if (!profileData) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-100 min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary relative z-0">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#1a1b26]">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pastel-blue rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-10"></div>
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-peach rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-10"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-tertiary rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-10"></div>
        <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-secondary rounded-full mix-blend-multiply filter blur-[90px] opacity-40 dark:opacity-10"></div>
      </div>

      <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-xl">work</span>
            </div>
            <div className="relative hidden md:block">
              <span className="absolute left-3 top-2 text-slate-400 material-symbols-outlined text-[20px]">search</span>
              <input className="w-64 pl-10 h-9 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary transition-all" placeholder="Search" type="text" />
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-6">
            <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group px-2" href="#">
              <span className="material-symbols-outlined fill text-[24px] group-hover:scale-110 transition-transform">home</span>
              <span className="text-[10px] font-medium hidden md:block">Home</span>
            </a>
            <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group px-2 relative" href="#">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">group</span>
              <span className="text-[10px] font-medium hidden md:block">Network</span>
              <span className="absolute top-0 right-1 w-2 h-2 bg-tertiary rounded-full ring-2 ring-white dark:ring-slate-800"></span>
            </a>
            <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group px-2" href="#">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">work</span>
              <span className="text-[10px] font-medium hidden md:block">Jobs</span>
            </a>
            <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group px-2" href="#">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">chat</span>
              <span className="text-[10px] font-medium hidden md:block">Messaging</span>
            </a>
            <a className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group px-2" href="#">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">notifications</span>
              <span className="text-[10px] font-medium hidden md:block">Notifs</span>
            </a>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="size-9 rounded-lg bg-cover bg-center border-2 border-slate-200 dark:border-slate-700 group-hover:border-primary transition-colors" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPXuhkI3HSD2MLpMVodD2zDTTl-D7WdzKmo3oUb39Y5LfJ9Ur8J4PfM04gfmmTgqLC1Z-0N_pJmnfnn72Iq7_bUv47qeJYS36l-oxapNvkAvsPHz719YefwF-9dvz7VUWnfZz74PrbqarxmhsReXI-rMR12T9NImUB6WN7h19m1IAW1s1JHpym_la5dcSISsC77Onps2mJTSoM0J8rjFXMGYNhVHGPDzCcJdqYoSZtrEeoJawZ8afIvf3qkwzz-mrMkgUe_Tbd-Wg")` }}></div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Me</span>
                <span className="material-symbols-outlined text-[14px] text-slate-400">arrow_drop_down</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-0 md:px-4 py-6 space-y-6">
        <header className="bg-surface-light dark:bg-surface-dark md:rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-pastel-blue via-secondary to-peach relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
            <button className="absolute top-4 right-4 bg-white/40 dark:bg-black/50 p-2 rounded-lg hover:scale-105 transition text-white backdrop-blur-md opacity-0 group-hover:opacity-100">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </button>
          </div>
          <div className="px-6 md:px-8 pb-6 relative">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="-mt-20 md:-mt-24 mb-3 relative group/avatar">
                <div className="size-32 md:size-40 rounded-lg border-[6px] border-surface-light dark:border-surface-dark bg-slate-200 shadow-xl bg-cover bg-center" style={{ backgroundImage: `url("${profileData.avatarUrl}")` }}></div>
                <button className="absolute bottom-2 right-2 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-600 text-primary p-2 rounded-lg shadow hover:scale-110 transition cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <div className="absolute bottom-3 left-3 bg-green-400 border-4 border-surface-light dark:border-surface-dark size-5 rounded-md shadow-sm" title="Online"></div>
              </div>
              <div className="hidden md:flex items-center gap-3 mt-4">
                <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Connect
                </button>
                <button className="px-6 py-2.5 bg-white dark:bg-transparent border border-secondary text-secondary hover:bg-secondary/5 font-semibold rounded-lg transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Message
                </button>
                <button className="px-3 py-2 text-tertiary border border-tertiary/50 rounded-lg hover:bg-tertiary/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{profileData.fullName}</h1>
                <span className="text-slate-500 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{profileData.pronouns}</span>
                <button className="text-primary hover:text-primary/80 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
              <p className="text-lg text-slate-700 dark:text-slate-300 font-medium max-w-2xl">{profileData.headline}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-pastel-blue">location_on</span>
                  {profileData.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-peach">work</span>
                  {profileData.status}
                </span>
                <a className="text-primary hover:underline font-semibold" href="#">Contact info</a>
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="font-bold text-slate-900 dark:text-white hover:text-primary cursor-pointer hover:underline">{profileData.connectionsCount}</span>
                <span className="text-slate-500">connections</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="font-bold text-slate-900 dark:text-white hover:text-primary cursor-pointer hover:underline">{profileData.followersCount}</span>
                <span className="text-slate-500">followers</span>
              </div>
              <div className="flex md:hidden flex-wrap items-center gap-3 mt-6 w-full">
                <button className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-md transition-colors text-sm">Connect</button>
                <button className="flex-1 py-2.5 bg-white dark:bg-transparent border border-secondary text-secondary hover:bg-secondary/5 font-semibold rounded-lg transition-colors text-sm">Message</button>
                <button className="px-3 py-2.5 text-tertiary border border-tertiary rounded-lg hover:bg-tertiary/5 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-8 mt-8 border-t border-slate-100 dark:border-slate-800 pt-1 overflow-x-auto no-scrollbar">
              <button className="px-1 py-3 border-b-[3px] border-primary text-primary font-bold text-sm whitespace-nowrap">Profile</button>
              <button className="px-1 py-3 border-b-[3px] border-transparent text-slate-600 dark:text-slate-400 hover:text-primary hover:border-slate-200 dark:hover:text-white font-medium text-sm whitespace-nowrap transition-colors">Posts</button>
              <button className="px-1 py-3 border-b-[3px] border-transparent text-slate-600 dark:text-slate-400 hover:text-primary hover:border-slate-200 dark:hover:text-white font-medium text-sm whitespace-nowrap transition-colors">Activity</button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-primary text-lg">About</h3>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profileData.about}
              </p>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">Contact Info</h3>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm group/item">
                  <div className="size-8 rounded-lg bg-pastel-blue/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">language</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Website</p>
                    <a className="text-slate-500 hover:text-primary hover:underline truncate block w-48 transition-colors" href={`http://${profileData.contactInfo.website}`} target="_blank" rel="noreferrer">{profileData.contactInfo.website}</a>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm group/item">
                  <div className="size-8 rounded-lg bg-tertiary/20 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Email</p>
                    <a className="text-slate-500 hover:text-primary hover:underline truncate block w-48 transition-colors" href={`mailto:${profileData.contactInfo.email}`}>{profileData.contactInfo.email}</a>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-sm group/item">
                  <div className="size-8 rounded-lg bg-peach/20 flex items-center justify-center text-peach">
                    <span className="material-symbols-outlined text-[18px]">cake</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Birthday</p>
                    <span className="text-slate-600 dark:text-slate-400">{profileData.contactInfo.birthday}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">Education</h3>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
              </div>
              {profileData.education && profileData.education.map(edu => (
                <div key={edu.id} className="flex gap-3 items-start mt-4 first:mt-0">
                  <div className="size-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0 text-secondary mt-1 overflow-hidden">
                    {edu.logoUrl ? (
                      <img src={edu.logoUrl} alt={edu.schoolName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined">school</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.schoolName}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{edu.degree}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{edu.years}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-5 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">Skills</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills && profileData.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-pastel-blue/20 text-xs font-semibold text-slate-900 dark:text-slate-200 border border-pastel-blue/30 hover:bg-pastel-blue/30 cursor-pointer transition-all">
                    {skill}
                  </span>
                ))}
              </div>
              <button className="w-full mt-5 py-2.5 text-sm font-bold text-secondary hover:bg-secondary/5 rounded-lg transition-colors border border-dashed border-secondary/30 hover:border-secondary">
                Show all {profileData.totalSkillsCount} skills
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400 p-2 text-center">
              <a className="hover:underline hover:text-primary" href="#">Privacy Policy</a>
              <a className="hover:underline hover:text-primary" href="#">User Agreement</a>
              <a className="hover:underline hover:text-primary" href="#">Cookie Policy</a>
              <a className="hover:underline hover:text-primary" href="#">Copyright Policy</a>
              <span className="block w-full mt-2">CV Manager Corporation © 2023</span>
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex gap-3 items-center hover:shadow-md transition-shadow">
              <div className="size-12 rounded-lg bg-cover bg-center shrink-0 border-2 border-slate-100 dark:border-slate-700" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPXuhkI3HSD2MLpMVodD2zDTTl-D7WdzKmo3oUb39Y5LfJ9Ur8J4PfM04gfmmTgqLC1Z-0N_pJmnfnn72Iq7_bUv47qeJYS36l-oxapNvkAvsPHz719YefwF-9dvz7VUWnfZz74PrbqarxmhsReXI-rMR12T9NImUB6WN7h19m1IAW1s1JHpym_la5dcSISsC77Onps2mJTSoM0J8rjFXMGYNhVHGPDzCcJdqYoSZtrEeoJawZ8afIvf3qkwzz-mrMkgUe_Tbd-Wg")` }}></div>
              <button className="flex-1 text-left px-5 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 font-medium text-sm">
                Share an update, project, or article...
              </button>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Experience</h2>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition"><span className="material-symbols-outlined text-[20px]">add</span></button>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                </div>
              </div>
              <div className="space-y-8 relative before:absolute before:left-6 before:top-14 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                {profileData.experiences && profileData.experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 relative">
                    <div className="size-12 rounded-lg bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center shrink-0 shadow-sm z-10 p-2 overflow-hidden">
                      {exp.logoUrl ? (
                        <img alt={exp.company} className="size-full object-contain opacity-90" src={exp.logoUrl} />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400">domain</span>
                      )}
                    </div>
                    <div className="flex-1 pb-6 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{exp.title}</h3>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{exp.company}</div>
                          <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>{exp.type}</span>
                            <span className="text-[10px]">•</span>
                            <span>{exp.dateRange}</span>
                            {exp.duration && (
                              <>
                                <span className="text-[10px]">•</span>
                                <span className="text-primary font-medium">{exp.duration}</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-slate-500 mt-0.5">{exp.location}</div>
                        </div>
                        <button className="text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {exp.description}
                      </p>
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {exp.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2 py-1 rounded-md bg-pastel-blue/10 border border-pastel-blue/20 text-[10px] font-bold text-slate-600 dark:text-slate-300">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Projects</h2>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition"><span className="material-symbols-outlined text-[20px]">add</span></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileData.projects && profileData.projects.map((proj) => (
                  <div key={proj.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-0 overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group/card bg-white dark:bg-surface-dark flex flex-col h-full">
                    <div className="h-32 bg-pastel-blue/20 w-full relative group cursor-pointer flex items-center justify-center">
                      <span className="material-symbols-outlined text-pastel-blue text-5xl">image</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover/card:text-primary transition-colors cursor-pointer">{proj.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                        {proj.description}
                      </p>
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{proj.year} • {proj.category}</span>
                        <a className="text-primary hover:text-primary/80" href={proj.link}><span className="material-symbols-outlined text-[18px]">open_in_new</span></a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8 group hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Licenses &amp; Certifications</h2>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition"><span className="material-symbols-outlined text-[20px]">add</span></button>
                </div>
              </div>
              <div className="space-y-4">
                {profileData.certifications && profileData.certifications.map((cert) => (
                  <div key={cert.id} className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                    <div className="size-12 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm p-2 overflow-hidden">
                      {cert.logoUrl ? (
                        <img alt={cert.organization} className="w-full h-full object-contain" src={cert.logoUrl} />
                      ) : (
                        <span className="text-xs font-bold text-blue-600">{cert.organization.substring(0, 3).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white hover:text-primary cursor-pointer hover:underline">{cert.name}</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{cert.organization}</p>
                      <p className="text-sm text-slate-500">{cert.issueDate}</p>
                      {cert.logoUrl && (
                        <button className="mt-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Show Credential</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;