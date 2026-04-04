import React, { useState } from 'react';

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
  const sorted = Object.keys(counts).sort((a,b) => counts[b] - counts[a]);
  return sorted.slice(0, 2);
};

const NestedReplyItem = ({ reply, commentAuthorId, formatDate, getAuthToken, handleOpenReply }) => {
  const [reactionType, setReactionType] = useState(reply.userReactionType || null);
  const [reactionsCount, setReactionsCount] = useState(reply.reactionsCount || 0);
  const [allTypes, setAllTypes] = useState(reply.allTypes || []);

  const handleToggleReaction = async (type) => {
    const isRemoving = reactionType === type;
    const previousType = reactionType;
    
    setReactionType(isRemoving ? null : type);
    if (isRemoving) {
      setReactionsCount(prev => prev - 1);
      setAllTypes(prev => {
        const idx = prev.indexOf(type);
        if (idx > -1) {
          const newArr = [...prev];
          newArr.splice(idx, 1);
          return newArr;
        }
        return prev;
      });
    } else {
      setReactionsCount(prev => (previousType ? prev : prev + 1));
      setAllTypes(prev => {
        const newArr = [...prev];
        if (previousType) {
           const idx = newArr.indexOf(previousType);
           if (idx > -1) newArr.splice(idx, 1);
        }
        newArr.push(type);
        return newArr;
      });
    }

    try {
      if (isRemoving) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${reply.id}/reactions`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${reply.id}/reactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type })
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex gap-3 relative">
      <div className="size-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
        {reply.author?.avatar ? (
          <img alt={reply.author.fullName} className="w-full h-full object-cover" src={reply.author.avatar} />
        ) : (
          <span className="material-symbols-outlined text-[14px] text-gray-500">person</span>
        )}
      </div>
      <div className="flex-1">
        <div className="relative bg-surface-container-low dark:bg-gray-800 p-2.5 rounded-2xl rounded-tl-none">
          <div className="flex justify-between items-start mb-1">
            <h5 className="text-xs font-bold text-text-main dark:text-white">
              {reply.author?.fullName || 'Unknown User'}
              {commentAuthorId === reply.author?.userId && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] uppercase tracking-wider">Author</span>
              )}
            </h5>
            <span className="text-[10px] text-text-secondary dark:text-gray-400">
                {formatDate(reply.createdAt)}
            </span>
          </div>
          <p className="text-xs text-text-main dark:text-gray-200">
             {reply.targetUser && (
               <span className="text-korra_active font-semibold mr-1">@{reply.targetUser.fullName}</span>
             )}
             {reply.content}
          </p>

          {reactionsCount > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 px-1 py-0.5 flex items-center gap-1 text-[10px] z-10">
               {getTopReactions(allTypes).map(r => <span key={r}>{REACTION_ICONS[r]?.icon}</span>)}
               <span className="text-gray-500 font-medium px-0.5">{reactionsCount}</span>
            </div>
          )}
        </div>
        <div className="relative flex gap-4 mt-1 ml-2 text-[10px] font-bold text-text-secondary dark:text-gray-400">
          <div className="relative group">
            <button 
               className={`hover:text-korra_active transition-colors ${reactionType ? REACTION_ICONS[reactionType]?.color : ''}`}
               onClick={() => handleToggleReaction('Like')}
            >
               {reactionType ? `${REACTION_ICONS[reactionType].icon} ${reactionType}` : 'Like'}
            </button>
            
            <div className="absolute bottom-full left-0 pb-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
               <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex gap-1 p-1">
                 {Object.keys(REACTION_ICONS).map(type => (
                    <button 
                       key={type}
                       onClick={() => handleToggleReaction(type)}
                       className="hover:scale-125 transition-transform origin-bottom text-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                       title={type}
                    >
                       {REACTION_ICONS[type].icon}
                    </button>
                 ))}
               </div>
            </div>
          </div>
          <button className="hover:text-korra_active" onClick={() => handleOpenReply(reply.id, reply.author?.fullName)}>Reply</button>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({ comment, getAuthToken, user, formatDate }) => {
  const [replies, setReplies] = useState([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, fullName }

  // Reaction State
  const [reactionType, setReactionType] = useState(comment.userReactionType || null);
  const [reactionsCount, setReactionsCount] = useState(comment.reactionsCount || 0);
  const [allTypes, setAllTypes] = useState(comment.allTypes || []);

  const fetchReplies = async (loadMore = false) => {
    try {
      if (loadMore) setLoadingMore(true);
      const cursor = loadMore && replies.length > 0 ? replies[replies.length - 1].createdAt : '';
      const query = cursor ? `?cursor=${cursor}&limit=10` : '?limit=10';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${comment.id}/replies${query}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedReplies = data.replies || [];
        setReplies(prev => loadMore ? [...prev, ...fetchedReplies] : fetchedReplies);
        setHasMoreReplies(fetchedReplies.length === 10);
        if (!loadMore) setRepliesLoaded(true);
      }
    } catch (e) {
      console.error('Failed to fetch replies', e);
    } finally {
      if (loadMore) setLoadingMore(false);
    }
  };

  const handleShowReplies = () => {
    if (!repliesLoaded) {
      fetchReplies();
    }
    // Logic to toggle replies if we want to collapse them later
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    const targetCommentId = replyingTo ? replyingTo.id : comment.id;
    const tempId = `temp-reply-${Date.now()}`;
    const newReply = {
      id: tempId,
      content: replyInput,
      createdAt: new Date().toISOString(),
      author: {
        userId: user.userId || 'guest',
        avatar: user.avatar,
        fullName: user.fullName
      },
      targetUser: replyingTo ? { fullName: replyingTo.fullName } : null
    };
    
    setReplies(prev => [...prev, newReply]);
    setReplyInput('');
    setShowReplyInput(false);
    setReplyingTo(null);

    // If replies aren't loaded yet, fetch them to populate the tree after submitting our optimistic one.
    if (!repliesLoaded) {
       fetchReplies();
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${targetCommentId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newReply.content })
      });
      
      if (response.ok) {
         const data = await response.json();
         // Update tempid
         setReplies(prev => prev.map(r => r.id === tempId ? { ...data.comment, targetUser: newReply.targetUser } : r));
      }
    } catch (e) {
      console.error(e);
      setReplies(prev => prev.filter(r => r.id !== tempId));
    }
  };

  const handleOpenReply = (targetId, targetFullName) => {
    setReplyingTo({ id: targetId, fullName: targetFullName });
    setShowReplyInput(true);
  };

  const handleToggleReaction = async (type) => {
    const isRemoving = reactionType === type;
    const previousType = reactionType;
    
    // Optimistic Update
    setReactionType(isRemoving ? null : type);
    if (isRemoving) {
      setReactionsCount(prev => prev - 1);
      setAllTypes(prev => {
        const idx = prev.indexOf(type);
        if (idx > -1) {
          const newArr = [...prev];
          newArr.splice(idx, 1);
          return newArr;
        }
        return prev;
      });
    } else {
      setReactionsCount(prev => (previousType ? prev : prev + 1));
      setAllTypes(prev => {
        const newArr = [...prev];
        if (previousType) {
           const idx = newArr.indexOf(previousType);
           if (idx > -1) newArr.splice(idx, 1);
        }
        newArr.push(type);
        return newArr;
      });
    }

    try {
      if (isRemoving) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${comment.id}/reactions`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/comments/${comment.id}/reactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type })
        });
      }
    } catch (e) {
      console.error('Failed to update reaction', e);
      // Fallback code here if needed
    }
  };

  // Avoid shadowing the external helper
  const topRx = getTopReactions(allTypes);

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
        {comment.author?.avatar ? (
          <img alt={comment.author.fullName} className="w-full h-full object-cover" src={comment.author.avatar} />
        ) : (
          <span className="material-symbols-outlined text-[18px] text-gray-500">person</span>
        )}
      </div>

      <div className="flex-1">
        {/* Comment Bubble */}
        <div className="bg-surface-container-low dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none">
          <div className="flex justify-between items-start mb-1">
            <h5 className="text-sm font-bold text-text-main dark:text-white">{comment.author?.fullName || 'Unknown User'}</h5>
            <span className="text-[10px] text-text-secondary dark:text-gray-400">
                {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-text-main dark:text-gray-200">{comment.content}</p>
          
          {reactionsCount > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600 px-1 py-0.5 flex items-center gap-1 text-[10px]">
               {topRx.map(r => <span key={r}>{REACTION_ICONS[r]?.icon}</span>)}
               <span className="text-gray-500 font-medium px-0.5">{reactionsCount}</span>
            </div>
          )}
        </div>

        {/* Comment Actions */}
        <div className="relative flex gap-4 mt-1 ml-2 text-[11px] font-bold text-text-secondary dark:text-gray-400">
          <div className="relative group">
            <button 
               className={`hover:text-korra_active transition-colors ${reactionType ? REACTION_ICONS[reactionType]?.color : ''}`}
               onClick={() => handleToggleReaction('Like')}
            >
               {reactionType ? `${REACTION_ICONS[reactionType].icon} ${reactionType}` : 'Like'}
            </button>
            
            {/* Reaction Picker Popup */}
            <div className="absolute bottom-full left-0 pb-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
               <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex gap-1 p-1">
                 {Object.keys(REACTION_ICONS).map(type => (
                    <button 
                       key={type}
                       onClick={() => handleToggleReaction(type)}
                       className="hover:scale-125 transition-transform origin-bottom text-lg p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                       title={type}
                    >
                       {REACTION_ICONS[type].icon}
                    </button>
                 ))}
               </div>
            </div>
          </div>
          <button className="hover:text-korra_active" onClick={() => handleOpenReply(comment.id, comment.author?.fullName)}>Reply</button>
          {!repliesLoaded && comment.replyCount > 0 && (
             <button className="hover:text-korra_active text-korra_active" onClick={handleShowReplies}>
                 View {comment.replyCount} replies
             </button>
          )}
        </div>

        {/* Reply Input Form */}
        {showReplyInput && (
          <form onSubmit={handleAddReply} className="mt-3 relative pl-8">
            <div className="absolute left-3 top-0 bottom-4 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex gap-2 items-center relative">
              {replyingTo && replyingTo.id !== comment.id && (
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-korra_active font-medium z-10 pointers-events-none">
                   @{replyingTo.fullName}
                 </span>
              )}
              <input 
                autoFocus
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                style={{ paddingLeft: replyingTo && replyingTo.id !== comment.id ? `${replyingTo.fullName.length * 7 + 25}px` : '12px' }}
                className="flex-1 py-1.5 px-3 rounded-full border border-gray-200 dark:border-gray-600 bg-surface-container-low dark:bg-gray-800 text-xs focus:ring-2 focus:ring-korra_active focus:border-transparent outline-none" 
                placeholder="Reply to this comment..." 
                type="text"
              />
              <button disabled={!replyInput.trim()} type="submit" className="text-korra_active bg-primary/10 rounded-full size-7 flex items-center justify-center disabled:opacity-50">
                 <span className="material-symbols-outlined text-[14px]">send</span>
              </button>
            </div>
          </form>
        )}

        {/* Nested Replies Rendering */}
        {replies.length > 0 && (
          <div className="mt-4 relative pl-8 space-y-4">
            <div className="absolute left-3 top-0 bottom-4 w-px bg-gray-200 dark:bg-gray-700"></div>
            {replies.map(reply => (
              <NestedReplyItem 
                 key={reply.id} 
                 reply={reply} 
                 commentAuthorId={comment.author?.userId}
                 formatDate={formatDate}
                 getAuthToken={getAuthToken}
                 handleOpenReply={handleOpenReply}
              />
            ))}
            {hasMoreReplies && (
              <div className="pl-9 pt-2">
                <button 
                  onClick={() => fetchReplies(true)} 
                  disabled={loadingMore}
                  className="text-[11px] font-bold text-text-secondary hover:text-korra_active flex items-center gap-1">
                  {loadingMore ? 'Loading...' : 'View more replies'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
