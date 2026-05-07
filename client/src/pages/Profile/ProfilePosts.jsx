import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfilePosts = ({ userId, token, isOwner, profileData }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const targetId = userId || profileData?.userId;
        if (!targetId || targetId === 'me') {
           setLoading(false);
           return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/v1/users/${targetId}/posts`, { headers });
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileData) fetchPosts();
  }, [userId, profileData, token]);

  if (loading) return (
    <div className="flex justify-center p-8">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">post_add</span>
          <p className="text-slate-500 font-medium">{isOwner ? "You haven't posted anything yet." : "No posts yet."}</p>
        </div>
      ) : (
        posts.map(post => (
          <article key={post.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-6 group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="size-12 rounded-lg bg-cover bg-center shrink-0 border-2 border-slate-100 dark:border-slate-700" style={{ backgroundImage: `url(${post.author?.avatarUrl || profileData.avatarUrl || ''})` }}>
                  {(!post.author?.avatarUrl && !profileData.avatarUrl) && (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold">
                      {(post.author?.name || profileData.fullName || 'U').charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{post.author?.name || profileData.fullName}</h3>
                    {isOwner && <span className="text-xs text-slate-400">• You</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{post.author?.headline || profileData.headline}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="material-symbols-outlined text-[14px]">public</span>
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
            
            {post.mediaUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 mb-4">
                <img src={post.mediaUrl} alt="Post content" className="w-full object-cover max-h-96" />
              </div>
            )}
            
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2 mt-4">
              <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 ${post.isLiked ? 'text-primary' : 'text-slate-500'} font-semibold text-sm transition-colors group/btn`}>
                <span className={`material-symbols-outlined ${post.isLiked ? 'fill' : ''} group-hover/btn:scale-110 transition-all`}>thumb_up</span>
                <span className="hidden sm:inline">Like</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-semibold text-sm transition-colors group/btn">
                <span className="material-symbols-outlined group-hover/btn:scale-110 transition-all">comment</span>
                <span className="hidden sm:inline">Comment</span>
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
};

export default ProfilePosts;
