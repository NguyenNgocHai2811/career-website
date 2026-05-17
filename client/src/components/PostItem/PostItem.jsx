import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import CommentSection from '../Comments/CommentSection';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

const PostItem = ({ post, onToggleLike, getAuthToken, user, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const shareRef = useRef(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const CHAR_LIMIT = 300;
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const menuRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);
  const reactionsRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const handleLikePressStart = (e) => {
    longPressTriggered.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setShowReactions(true);
    }, 400);
  };

  const handleLikePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleLikeClick = (e) => {
    if (longPressTriggered.current) {
      e.preventDefault();
      longPressTriggered.current = false;
      return;
    }
    onToggleLike(post.id, 'Like', post.userReactionType === 'Like');
  };

  const pickReaction = (type) => {
    onToggleLike(post.id, type, post.userReactionType === type);
    setShowReactions(false);
  };

  const REPORT_REASONS = ['Spam', 'Thông tin sai lệch', 'Ngôn từ thù địch', 'Nội dung không phù hợp', 'Quấy rối', 'Khác'];

  const handleReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/v1/posts/${post.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reportReason }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setReportDone(true);
      setTimeout(() => { setShowReportModal(false); setReportDone(false); setReportReason(''); }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  const authorId = post.author?.userId || post.author?.id;
  const isAuthor = user && authorId && String(user.userId) === String(authorId);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
      if (shareRef.current && !shareRef.current.contains(e.target)) setShowShareMenu(false);
      if (reactionsRef.current && !reactionsRef.current.contains(e.target)) setShowReactions(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/v1/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editContent.trim(), privacy: post.privacy || 'Public' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu');
      onUpdate?.({ ...post, content: editContent.trim(), updatedAt: data.post?.updatedAt });
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa bài viết này?')) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API}/v1/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      onDelete?.(post.id);
    } catch (err) {
      alert(err.message);
    }
  };

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
                {post.updatedAt && post.updatedAt !== post.createdAt && <span className="ml-1 opacity-60">(đã sửa)</span>}
              </p>
            </div>
          </div>

          {/* Action menu */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(v => !v)}
                className="text-text-secondary hover:text-text-main dark:text-gray-400 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50">
                  {isAuthor ? (
                    <>
                      <button
                        onClick={() => { setEditing(true); setEditContent(post.content || ''); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Xóa bài viết
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-amber-500">flag</span>
                      Báo cáo bài viết
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Report Modal — rendered via portal to escape overflow:hidden */}
          {showReportModal && createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                {reportDone ? (
                  <div className="flex flex-col items-center py-4 gap-3">
                    <span className="material-symbols-outlined text-5xl text-green-500">check_circle</span>
                    <p className="font-bold text-gray-800 dark:text-white">Báo cáo đã được ghi nhận</p>
                    <p className="text-sm text-gray-500 text-center">Chúng tôi sẽ xem xét và xử lý sớm nhất.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Báo cáo bài viết</h3>
                    <p className="text-xs text-gray-500 mb-4">Chọn lý do phù hợp nhất với nội dung vi phạm.</p>
                    <div className="space-y-2 mb-5">
                      {REPORT_REASONS.map(reason => (
                        <label key={reason} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name={`reportReason-${post.id}`}
                            value={reason}
                            checked={reportReason === reason}
                            onChange={() => setReportReason(reason)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200">{reason}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowReportModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Hủy</button>
                      <button
                        onClick={handleReport}
                        disabled={!reportReason || reportSubmitting}
                        className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold disabled:opacity-50 hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {reportSubmitting && <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Gửi báo cáo
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>,
            document.body
          )}
        </div>

        {editing ? (
          <div className="mb-4">
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm text-text-main dark:text-white resize-none focus:ring-2 focus:ring-primary/30 outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Hủy</button>
              <button onClick={handleSaveEdit} disabled={saving || !editContent.trim()} className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-60 flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
                {saving && <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Lưu
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-text-main dark:text-gray-200 leading-relaxed text-[15px] font-medium whitespace-pre-line">
              {post.content && post.content.length > CHAR_LIMIT && !expanded
                ? post.content.slice(0, CHAR_LIMIT).trimEnd() + '…'
                : post.content}
            </p>
            {post.content && post.content.length > CHAR_LIMIT && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="mt-1 text-sm font-bold text-primary hover:underline"
              >
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

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
          <div className="flex-1 relative group" ref={reactionsRef}>
            <button
              onClick={handleLikeClick}
              onTouchStart={handleLikePressStart}
              onTouchEnd={handleLikePressEnd}
              onTouchMove={handleLikePressEnd}
              onTouchCancel={handleLikePressEnd}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-sm select-none touch-manipulation ${post.userReactionType ? 'text-primary bg-primary/5' : 'text-text-secondary dark:text-gray-400'} ${post.userReactionType ? REACTION_ICONS[post.userReactionType]?.color : ''}`}
              style={{ WebkitTouchCallout: 'none' }}
            >
              {post.userReactionType && REACTION_ICONS[post.userReactionType] ? (
                <span className="text-[20px]">{REACTION_ICONS[post.userReactionType].icon}</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              )}
              {post.userReactionType || 'Like'}
            </button>
            <div
              className={`absolute bottom-full left-0 pb-2 w-full flex justify-center z-20 transition-all duration-200 ${
                showReactions
                  ? 'opacity-100 visible translate-y-0'
                  : 'opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0'
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 flex gap-1 sm:gap-2 p-1.5 animate-fade-in-up">
                {Object.keys(REACTION_ICONS).map(type => (
                  <button
                    key={type}
                    onClick={() => pickReaction(type)}
                    className="hover:scale-125 active:scale-110 transition-transform origin-bottom text-2xl p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full"
                    title={type}
                    aria-label={type}
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
          <div className="flex-1 relative" ref={shareRef}>
            <button
              onClick={() => setShowShareMenu(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-text-secondary dark:text-gray-400 font-medium text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">share</span> Share
            </button>

            {showShareMenu && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-30">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/feed?postId=${post.id}`;
                    navigator.clipboard.writeText(url).then(() => {
                      setCopyDone(true);
                      setTimeout(() => { setCopyDone(false); setShowShareMenu(false); }, 1500);
                    });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {copyDone ? 'check_circle' : 'link'}
                  </span>
                  {copyDone ? 'Đã sao chép!' : 'Sao chép liên kết'}
                </button>

                {typeof navigator.share === 'function' && (
                  <button
                    onClick={() => {
                      navigator.share({
                        title: `Bài viết của ${post.author?.fullName || 'ai đó'}`,
                        text: post.content?.slice(0, 100),
                        url: `${window.location.origin}/feed?postId=${post.id}`,
                      }).finally(() => setShowShareMenu(false));
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-green-500">ios_share</span>
                    Chia sẻ qua ứng dụng
                  </button>
                )}
              </div>
            )}
          </div>
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
