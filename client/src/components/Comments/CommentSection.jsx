import React, { useState, useEffect } from 'react';
import CommentItem from './CommentItem';

const CommentSection = ({ postId, getAuthToken, user, formatDate }) => {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts/${postId}/comments`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to fetch comments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const newComment = {
      id: tempId,
      content: commentInput,
      createdAt: new Date().toISOString(),
      author: {
        userId: user.userId || 'guest',
        avatar: user.avatar,
        fullName: user.fullName
      },
      replyCount: 0
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.content })
      });
      
      if (response.ok) {
         const data = await response.json();
         setComments(prev => prev.map(c => c.id === tempId ? data.comment : c));
      } else {
         throw new Error('Failed to post comment');
      }
    } catch (e) {
      console.error(e);
      // Revert optimistic
      setComments(prev => prev.filter(c => c.id !== tempId));
    }
  };

  return (
    <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700 pb-5 space-y-6">
      {/* Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-3 items-start px-5">
        <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
          {user.avatar ? (
            <img alt="User avatar" className="w-full h-full object-cover" src={user.avatar} />
          ) : (
            <span className="material-symbols-outlined text-[18px] text-gray-500">person</span>
          )}
        </div>
        <div className="flex-1 relative">
          <input 
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="w-full py-2 px-4 pr-10 rounded-full border border-gray-200 dark:border-gray-600 bg-surface-container-low dark:bg-gray-800 text-sm focus:ring-2 focus:ring-korra_active focus:border-transparent outline-none" 
            placeholder="Add a comment..." 
            type="text"
            disabled={loading && comments.length === 0}
          />
          <button 
            type="submit" 
            disabled={!commentInput.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-korra_active disabled:opacity-50">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 px-5">
        {comments.map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            getAuthToken={getAuthToken} 
            user={user} 
            formatDate={formatDate} 
          />
        ))}
      </div>
      
      {/* View more stub */}
      {comments.length > 5 && (
        <div className="px-5">
            <button className="w-full py-2 text-xs font-bold text-text-secondary hover:text-korra_active transition-colors">View more comments</button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
