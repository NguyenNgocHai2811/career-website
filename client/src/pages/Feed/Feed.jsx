import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostItem from '../../components/PostItem/PostItem';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  
  return date.toLocaleDateString();
};

const Feed = () => {
  const [user, setUser] = useState({
    fullName: 'Guest User',
    email: 'guest@example.com',
    role: 'Candidate',
    avatar: null
  });

  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // To handle the authorization token
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    // Attempt to load user from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          avatar: parsedUser.avatar || null
        });
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }

    // Fetch posts from API
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          content: postContent,
          privacy: 'Public'
        })
      });

      if (response.ok) {
        setPostContent('');
        fetchPosts(); // Refresh feed
      }
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId, currentIsLiked) => {
    // Optimistic UI Update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        return { 
          ...post, 
          isLiked: !currentIsLiked, 
          likesCount: currentIsLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1 
        };
      }
      return post;
    }));

    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts/${postId}/reactions`;
      const method = currentIsLiked ? 'DELETE' : 'POST';
      const body = currentIsLiked ? null : JSON.stringify({ type: 'LIKE' });
      const headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(url, { method, headers, ...(body && { body }) });
      
      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert Optimistic Update
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          return { 
            ...post, 
            isLiked: currentIsLiked, 
            likesCount: currentIsLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1) 
          };
        }
        return post;
      }));
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main antialiased bg-bubbles min-h-screen flex flex-col font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200/60 bg-white/80 dark:bg-card-dark/90 backdrop-blur-md px-6 py-3 shadow-sm">
        <div className="layout-container w-full max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 text-primary">
              <div className="size-8 bg-primary text-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">hexagon</span>
              </div>
              <h2 className="text-text-main dark:text-white text-xl font-bold tracking-tight">Korra</h2>
            </div>
            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Home</Link>
              <a href="#" className="text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Jobs</a>
              <a href="#" className="text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors">Roadmap</a>
              <Link to="/feed" className="text-primary text-sm font-bold relative after:content-[''] after:absolute after:-bottom-[22px] after:left-0 after:w-full after:h-[3px] after:bg-primary after:rounded-t-full">Feed</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="hidden lg:flex relative items-center">
              <span className="material-symbols-outlined absolute left-3 text-text-secondary text-[20px]">search</span>
              <input className="h-10 w-64 rounded-lg border-none bg-gray-100 dark:bg-gray-800 text-sm pl-10 pr-4 focus:ring-2 focus:ring-primary/50 placeholder:text-text-secondary" placeholder="Search" type="text" />
            </div>
            {/* Tools */}
            <div className="flex items-center gap-3">
              <button className="relative flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main dark:text-white">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-card-dark"></span>
              </button>
              <button className="flex items-center justify-center size-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-200">
                {user.avatar ? (
                  <img alt="User Avatar" className="w-full h-full object-cover" src={user.avatar} />
                ) : (
                  <span className="material-symbols-outlined text-gray-500">person</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 animate-slide-in-left sticky top-24">
            {/* Profile Card */}
            <div className="dark:bg-card-dark p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center bg-white rounded-xl">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background-light dark:border-background-dark shadow-md bg-gray-200 flex items-center justify-center">
                  {user.avatar ? (
                    <img alt="Profile Picture" className="w-full h-full object-cover" src={user.avatar} />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-500">person</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-1 size-5 bg-green-500 rounded-full border-2 border-white dark:border-card-dark" title="Online"></div>
              </div>
              <h3 className="text-lg font-bold text-text-main dark:text-white font-black">{user.fullName}</h3>
              <p className="text-sm text-text-secondary dark:text-gray-400 mt-1 mb-4">
                <span className="font-bold text-text-main dark:text-gray-200">{user.role}</span><br />
                <span className="text-xs font-medium">{user.email}</span>
              </p>
              <button className="w-full py-2 px-4 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-text-main dark:text-white">
                View Profile
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden bg-white rounded-xl">
              <div className="flex flex-col">
                <a href="#" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-orange-100 text-orange-600 flex items-center justify-center rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </div>
                    <span className="text-sm text-text-main dark:text-white font-bold">Invitations</span>
                  </div>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3 New</span>
                </a>
                <a href="#" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-blue-100 text-blue-600 flex items-center justify-center rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                    <span className="text-sm text-text-main dark:text-white font-bold">My Network</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </a>
                <a href="#" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-purple-100 text-purple-600 flex items-center justify-center rounded-xl">
                      <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    </div>
                    <span className="text-sm text-text-main dark:text-white font-bold">Saved Jobs</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Middle Column (Feed) */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-card-light dark:bg-card-dark rounded-lg p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
              <form onSubmit={handleCreatePost}>
                <div className="flex gap-4 mb-4">
                  <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar ? (
                      <img alt="User avatar" className="w-full h-full object-cover" src={user.avatar} />
                    ) : (
                      <span className="material-symbols-outlined text-gray-500">person</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full h-10 px-4 rounded-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow outline-none"
                      placeholder={`Start a post, ${user.fullName.split(' ')[0]}?`}
                      type="text"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary dark:text-gray-400 text-sm font-medium transition-colors">
                      <span className="material-symbols-outlined text-blue-500 text-[20px]">image</span>
                      Media
                    </button>
                    <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary dark:text-gray-400 text-sm font-medium transition-colors">
                      <span className="material-symbols-outlined text-orange-500 text-[20px]">calendar_month</span>
                      Event
                    </button>
                    <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-secondary dark:text-gray-400 text-sm font-medium transition-colors">
                      <span className="material-symbols-outlined text-red-400 text-[20px]">article</span>
                      Article
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!postContent.trim() || isSubmitting}
                    className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-bold disabled:opacity-50 transition-opacity"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>

            {/* Render Real Posts */}
            {posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post} 
                onToggleLike={handleToggleLike} 
                getAuthToken={getAuthToken} 
                user={user} 
              />
            ))}

            {/* Fallback mock post if no real posts exist */}
            {posts.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 animate-slide-in-right sticky top-24">
            {/* Suggestions */}
            <div className="dark:bg-card-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 bg-white rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-main dark:text-white text-base">People You May Know</h3>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">View all</a>
              </div>
              <div className="space-y-4">
                {/* Person 1 */}
                <div className="flex items-center gap-3">
                  <img alt="Elena Rodriguez" className="size-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4PxW8KKlArR2Sx9a5j2bpo1Y29t9TFOkTa_45kRvkfPpIZDFb81oE7ZNKfJ1dGg8nOfLhmnlXjXj3e5XjBljMK-wk8pngi7tpuaFS_esuTkATchshBOYzx5QHkS9LL7uIVJODV-Zr7u5fZs_9SK0ec4KmElbnscd-SdFICUccjdrvGdPr5eMEukxR159JH9CIOLBb9zhbqAlY0rPRV-1Pg85yZ_miilEQRR_CgffoUHewMsZ-TvoQba5jhEAA_WM-v2HIit33LTA" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm text-text-main dark:text-white truncate font-bold">Elena Rodriguez</h5>
                    <p className="text-xs text-text-secondary dark:text-gray-400 truncate">Product Manager @ Stripe</p>
                  </div>
                  <button className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </button>
                </div>
                {/* Person 2 */}
                <div className="flex items-center gap-3">
                  <img alt="Marcus Jones" className="size-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxUxVubEnr75IdRj4w2uPCXqfydohbWTXreMBlq7Ldl4tUIFw5HZEPg7o4t9ckHG8M5qU7bROBWh1OqvtkQj_D7fUo5ATqG5GV8NtW-hS6exjlgCJu0Jb6IyflNm3oRvxohyIUS9sduKBKenBX_ytGNYzJDEhlvmq7xNtDEpGFrtzqMVIKSoYK-r8wld6sVQ7Mlsd3XPzT6EnjIQzg5CrAoAcmLmOQUi6KQkJ1ROP-TRyhpSyjBUvJcqfNHn2prmkxunL2M1agD3w" />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm text-text-main dark:text-white truncate font-bold">Marcus Jones</h5>
                    <p className="text-xs text-text-secondary dark:text-gray-400 truncate">Senior Recruiter</p>
                  </div>
                  <button className="size-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trending Jobs */}
            <div className="dark:bg-card-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 bg-white rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-main dark:text-white text-base">Trending Jobs</h3>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">More</a>
              </div>
              <div className="space-y-4">
                <div className="group cursor-pointer">
                  <h5 className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors font-bold text-base">Senior React Developer</h5>
                  <p className="text-xs text-text-secondary dark:text-gray-400">TechCorp • Remote</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-medium">Active Hiring</span>
                    <span className="text-[10px] text-text-secondary">3 days ago</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100 dark:bg-gray-700"></div>
                <div className="group cursor-pointer">
                  <h5 className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors font-bold text-base">UX/UI Designer</h5>
                  <p className="text-xs text-text-secondary dark:text-gray-400">CreativeStudio • New York</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-medium">Easy Apply</span>
                    <span className="text-[10px] text-text-secondary">5 hrs ago</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-primary/30 text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors">
                View Recommendations
              </button>
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-2 text-center justify-center">
              <a className="text-xs text-text-secondary/70 hover:text-primary" href="#">About</a>
              <a className="text-xs text-text-secondary/70 hover:text-primary" href="#">Accessibility</a>
              <a className="text-xs text-text-secondary/70 hover:text-primary" href="#">Help Center</a>
              <a className="text-xs text-text-secondary/70 hover:text-primary" href="#">Privacy & Terms</a>
              <p className="text-xs text-text-secondary/50 w-full mt-2">© 2023 Korra Corporation</p>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default Feed;
