import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostItem from '../../components/PostItem/PostItem';
import AppHeader from '../../components/AppHeader/AppHeader';
import { searchUsersToConnect, sendConnectionRequest } from '../../services/networkService';

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
  const [suggestions, setSuggestions] = useState([]);

  const navigate = useNavigate();

  // To handle the authorization token
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    // Attempt to load user from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // If recruiter, attempt to load active company identity
        if (parsedUser.role?.toUpperCase() === 'RECRUITER') {
          const activeCompany = localStorage.getItem('activeCompany');
          if (activeCompany) {
            const companyData = JSON.parse(activeCompany);
            setUser({
              ...parsedUser,
              fullName: companyData.name,
              avatar: companyData.logoUrl,
              industry: companyData.industry,
              companyId: companyData.companyId,
              isCompanyIdentity: true
            });
          } else {
            setUser({ ...parsedUser, avatar: parsedUser.avatar || null });
          }
        } else {
          setUser({ ...parsedUser, avatar: parsedUser.avatar || null });
        }
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }

    // Fetch posts from API
    fetchPosts();
    // Load friend suggestions
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const token = getAuthToken();
      if(token) {
        const data = await searchUsersToConnect(token, '');
        setSuggestions(data.slice(0, 3)); // show top 3
      }
    } catch(err) { console.error('Failed to load suggestions:', err); }
  };

  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(getAuthToken(), userId);
      alert('Kết bạn thành công! (Request sent)');
      setSuggestions(prev => prev.filter(s => s.id !== userId));
    } catch(err) {
      alert(err.message);
    }
  };

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

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const fileInputRef = useRef(null);

  const handleMediaSelect = (type) => {
    setMediaType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && !mediaFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('privacy', 'Public');
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
          // Do NOT set Content-Type — browser sets it with boundary for FormData
        },
        body: formData
      });

      if (response.ok) {
        setPostContent('');
        handleRemoveMedia();
        fetchPosts();
      } else {
        const err = await response.json();
        console.error('Create post error:', err);
      }
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = async (postId, type, isRemoving) => {
    // Find previous state for revert logic
    const postToUpdate = posts.find(p => p.id === postId);
    const previousType = postToUpdate?.userReactionType;
    const previousCount = postToUpdate?.reactionsCount || 0;
    const previousAllTypes = postToUpdate?.allTypes || [];
    
    // Optimistic UI Update
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === postId) {
        let newReactionsCount = post.reactionsCount || 0;
        let newAllTypes = [...(post.allTypes || [])];
        
        if (isRemoving) {
          newReactionsCount = Math.max(0, newReactionsCount - 1);
          const idx = newAllTypes.indexOf(type);
          if (idx > -1) newAllTypes.splice(idx, 1);
        } else {
          newReactionsCount = previousType ? newReactionsCount : newReactionsCount + 1;
          if (previousType) {
             const idx = newAllTypes.indexOf(previousType);
             if (idx > -1) newAllTypes.splice(idx, 1);
          }
          newAllTypes.push(type);
        }

        return { 
          ...post, 
          userReactionType: isRemoving ? null : type, 
          reactionsCount: newReactionsCount,
          allTypes: newAllTypes
        };
      }
      return post;
    }));

    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts/${postId}/reactions`;
      const method = isRemoving ? 'DELETE' : 'POST';
      const body = isRemoving ? null : JSON.stringify({ type });
      const headers = {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(url, { method, headers, ...(body && { body }) });
      
      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Revert Optimistic Update
      setPosts(currentPosts => currentPosts.map(post => {
        if (post.id === postId) {
          return { 
            ...post, 
            userReactionType: previousType, 
            reactionsCount: previousCount,
            allTypes: previousAllTypes
          };
        }
        return post;
      }));
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main antialiased bg-bubbles min-h-screen flex flex-col font-body">
      <AppHeader activeTab="feed" />

      {/* Main Content Grid */}
      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* Mobile Profile Summary (Shown only on small screens) */}
        <div className="lg:hidden mb-6 animate-fade-in">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="size-14 rounded-xl overflow-hidden border-2 border-primary/20 bg-gray-200 flex items-center justify-center shrink-0">
              {user.avatar ? (
                <img alt="Profile" className="w-full h-full object-cover" src={user.avatar} />
              ) : (
                <span className="material-symbols-outlined text-gray-500">person</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{user.fullName}</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user.isCompanyIdentity ? user.industry : user.role}</p>
            </div>
            <Link
              to={user.isCompanyIdentity ? `/company/${user.companyId}` : `/profile/${user.userId}`}
              className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 items-start">

          {/* Left Sidebar - Hidden on mobile, shown on large screens */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 animate-slide-in-left sticky top-24">
            {/* Profile Card */}
            <div className="dark:bg-card-dark p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center bg-white rounded-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-primary/20 to-purple-500/20"></div>
              <div className="relative mb-4 mt-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-card-dark shadow-xl bg-gray-200 flex items-center justify-center">
                  {user.avatar ? (
                    <img alt="Profile Picture" className="w-full h-full object-cover" src={user.avatar} />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-500">person</span>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 size-4 bg-green-500 rounded-full border-2 border-white dark:border-card-dark"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user.fullName}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 mb-6">
                <span className="font-semibold text-primary">{user.isCompanyIdentity ? user.industry : user.role}</span>
              </p>
              <Link
                to={user.isCompanyIdentity ? `/company/${user.companyId}` : `/profile/${user.userId}`}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-100 dark:border-gray-700 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-slate-700 dark:text-slate-200 block text-center no-underline"
              >
                {user.isCompanyIdentity ? 'View Brand Page' : 'View Profile'}
              </Link>
            </div>

            {/* Navigation Menu */}
            <div className="dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden bg-white rounded-2xl">
              <div className="flex flex-col">
                <a href="#" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-700/50 group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-orange-50 text-orange-600 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold">Invitations</span>
                  </div>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                </a>
                <a href="#" className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-700/50 group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold">My Network</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Middle Column (Feed) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-white dark:bg-card-dark rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in-up">
              <form onSubmit={handleCreatePost}>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <div className="flex gap-3 mb-4">
                  <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                    {user.avatar ? (
                      <img alt="User avatar" className="w-full h-full object-cover" src={user.avatar} />
                    ) : (
                      <span className="material-symbols-outlined text-gray-500">person</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none min-h-[100px]"
                      placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </div>
                </div>
                
                {mediaPreview && (
                  <div className="relative mb-4 ml-0 md:ml-13 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-black/5 aspect-video flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video src={mediaPreview} controls className="max-w-full max-h-[300px]" />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="max-w-full max-h-[300px] object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="absolute top-3 right-3 size-8 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleMediaSelect('image')}
                      className="flex items-center justify-center size-9 md:w-auto md:px-3 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Photo"
                    >
                      <span className="material-symbols-outlined text-[20px]">image</span>
                      <span className="hidden md:inline ml-2 text-xs font-bold">Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMediaSelect('video')}
                      className="flex items-center justify-center size-9 md:w-auto md:px-3 rounded-xl text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                      title="Video"
                    >
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
                      <span className="hidden md:inline ml-2 text-xs font-bold">Video</span>
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={(!postContent.trim() && !mediaFile) || isSubmitting}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> : 'Post'}
                  </button>
                </div>
              </form>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} onToggleLike={handleToggleLike} getAuthToken={getAuthToken} user={user} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-card-dark rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">post_add</span>
                  <p className="text-sm text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile/tablet, shown on large screens */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 animate-slide-in-right sticky top-24">
            {/* Suggestions */}
            <div className="dark:bg-card-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 bg-white rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Recommended for you</h3>
              <div className="space-y-4">
                {suggestions.map(person => (
                  <div key={person.id} className="flex items-center gap-3 group">
                    <div className="size-10 rounded-xl flex items-center justify-center font-bold text-primary bg-primary/10 overflow-hidden shrink-0 border border-primary/5">
                      {person.avatarUrl ? <img src={person.avatarUrl} className="w-full h-full object-cover"/> : person.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{person.fullName}</h5>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{person.headline || 'Member'}</p>
                    </div>
                    <button onClick={()=>handleConnect(person.id)} className="size-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-slate-400 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Jobs */}
            <div className="dark:bg-card-dark p-5 shadow-sm border border-gray-100 dark:border-gray-700 bg-white rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Trending Jobs</h3>
              <div className="space-y-4">
                <div className="group cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Senior React Developer</h5>
                  <p className="text-[10px] text-slate-500 mt-1">TechCorp • Remote</p>
                </div>
                <div className="group cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">UX/UI Designer</h5>
                  <p className="text-[10px] text-slate-500 mt-1">CreativeStudio • NY</p>
                </div>
              </div>
            </div>

            <footer className="px-4 text-center">
              <p className="text-[10px] text-slate-400">© 2024 Korra Careers • Privacy • Terms</p>
            </footer>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default Feed;
