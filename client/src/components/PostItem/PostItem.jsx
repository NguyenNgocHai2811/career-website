import React, { useState } from 'react';
import CommentSection from '../Comments/CommentSection';

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

const PostItem = ({ post, onToggleLike, getAuthToken, user }) => {
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="bg-card-light dark:bg-card-dark rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in-up">
      <div className="p-5 pb-2 border-b-none">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {post.author?.avatar ? (
                <img alt={`${post.author.fullName} Avatar`} className="w-full h-full object-cover" src={post.author.avatar} />
              ) : (
                <span className="material-symbols-outlined text-gray-500">person</span>
              )}
            </div>
            <div>
              <h4 className="font-bold text-text-main dark:text-white text-base font-extrabold">{post.author?.fullName || 'Unknown User'}</h4>
              <p className="text-xs text-text-secondary dark:text-gray-400">
                {formatDate(post.createdAt || Date.now())}
              </p>
            </div>
          </div>
          <button className="text-text-secondary hover:text-text-main dark:text-gray-400 dark:hover:text-white">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
        
        <p className="text-text-main dark:text-gray-200 leading-relaxed mb-4 text-[15px] font-medium">
          {post.content}
        </p>
        
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="rounded-lg overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
            <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url('${post.mediaUrls[0]}')` }}></div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-text-secondary dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-blue-500 text-[14px] font-bold">thumb_up</span>
            <span className="font-bold text-text-main dark:text-gray-300">{post.likesCount || 0} likes</span>
          </div>
          <span className="font-bold text-text-main dark:text-gray-300 cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{post.commentsCount || 0} comments</span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <button 
            onClick={() => onToggleLike(post.id, post.isLiked)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm ${post.isLiked ? 'text-primary bg-primary/5' : 'text-text-secondary dark:text-gray-400'}`}>
            <span className={`material-symbols-outlined text-[20px] ${post.isLiked ? 'filled-icon' : ''}`} style={post.isLiked ? {fontVariationSettings: "'FILL' 1"} : {}}>thumb_up</span> Like
          </button>
          <button onClick={() => setShowComments(!showComments)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm ${showComments ? 'text-korra_active bg-gray-50 dark:bg-gray-800' : 'text-text-secondary dark:text-gray-400'}`}>
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span> Comment
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-secondary dark:text-gray-400 font-medium text-sm">
            <span className="material-symbols-outlined text-[20px]">share</span> Share
          </button>
        </div>
      </div>
      
      {/* Expanded Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} getAuthToken={getAuthToken} user={user} formatDate={formatDate} />
      )}
    </article>
  );
};

export default PostItem;
