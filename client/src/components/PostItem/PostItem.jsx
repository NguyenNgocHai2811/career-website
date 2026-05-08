import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentSection from '../Comments/CommentSection';

const REACTION_ICONS = {
  'Like': { icon: '👍', color: 'text-blue-500' },
  'Celebrate': { icon: '👏', color: 'text-green-500' },
  'Insightful': { icon: '💡', color: 'text-yellow-500' },
  'Love': { icon: '❤️', color: 'text-red-500' }
};

const getTopReactions = (allTypes) => {
  if (!allTypes || allTypes.length === 0) return [];
  const counts = allTypes.reduce((acc, t) => {
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  return sorted.slice(0, 2);
};

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
            <Link
              to={post.author?.type === 'COMPANY' ? `/company/${post.author?.id}` : `/profile/${post.author?.id || post.author?.userId || ''}`}
              className="no-underline relative shrink-0"
            >
              <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                {post.author?.avatar ? (
                  <img alt={`${post.author.fullName} Avatar`} className="w-full h-full object-cover" src={post.author.avatar} />
                ) : (
                  <span className="material-symbols-outlined text-gray-500">{post.author?.type === 'COMPANY' ? 'domain' : 'person'}</span>
                )}
              </div>
              {post.author?.type === 'COMPANY' && (
                <span className="absolute -bottom-0.5 -right-0.5 size-4.5 bg-primary rounded-full flex items-center justify-center border-2 border-white dark:border-card-dark shadow-sm">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 10 }}>domain</span>
                </span>
              )}
            </Link>
            <div>
              <Link 
                to={post.author?.type === 'COMPANY' ? `/company/${post.author?.id}` : `/profile/${post.author?.id || post.author?.userId || ''}`} 
                className="no-underline"
              >
                <h4 className="font-extrabold text-text-main dark:text-white text-base hover:text-primary transition-colors flex items-center gap-1.5">
                  {post.author?.fullName || 'Unknown'}
                  {post.author?.type === 'COMPANY' && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/8 text-primary border border-primary/15">
                      <span className="material-symbols-outlined" style={{ fontSize: 10 }}>verified</span>
                      Company
                    </span>
                  )}
                </h4>
              </Link>
              <p className="text-xs text-text-secondary dark:text-gray-400">
                {post.createdAt ? formatDate(post.createdAt) : ''}
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

        {post.mediaUrl && (
          <div className="rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            {post.mediaType === 'video' ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[480px] object-contain bg-black"
                playsInline
              />
            ) : (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-[480px] object-cover"
                loading="lazy"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-text-secondary dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-3 mb-3">
          <div className="flex items-center gap-1">
            {post.reactionsCount > 0 ? (
              <>
                {getTopReactions(post.allTypes).map(r => <span key={r} className="text-[14px]">{REACTION_ICONS[r]?.icon}</span>)}
                <span className="font-bold text-text-main dark:text-gray-300 px-1">{post.reactionsCount} reactions</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px] font-bold">thumb_up</span>
                <span className="font-bold text-text-main dark:text-gray-300">0 reactions</span>
              </>
            )}
          </div>
          <span className="font-bold text-text-main dark:text-gray-300 cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>{post.commentsCount || 0} comments</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 relative group">
            <button
              onClick={() => onToggleLike(post.id, 'Like', post.userReactionType === 'Like')}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm ${post.userReactionType ? 'text-primary bg-primary/5' : 'text-text-secondary dark:text-gray-400'} ${post.userReactionType ? REACTION_ICONS[post.userReactionType]?.color : ''}`}>
              {post.userReactionType && REACTION_ICONS[post.userReactionType] ? (
                <span className="text-[20px]">{REACTION_ICONS[post.userReactionType].icon}</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              )}
              {post.userReactionType || 'Like'}
            </button>
            <div className="absolute bottom-full left-0 pb-2 w-full flex justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex gap-2 p-1.5 animate-fade-in-up">
                {Object.keys(REACTION_ICONS).map(type => (
                  <button
                    key={type}
                    onClick={() => onToggleLike(post.id, type, post.userReactionType === type)}
                    className="hover:scale-125 transition-transform origin-bottom text-2xl p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                    title={type}
                  >
                    {REACTION_ICONS[type].icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
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
