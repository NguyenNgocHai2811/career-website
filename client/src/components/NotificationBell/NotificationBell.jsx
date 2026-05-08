import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';

const NOTIFICATION_ICONS = {
  NEW_MESSAGE: 'chat',
  JOB_APPLICATION: 'work',
  APPLICATION_STATUS_CHANGE: 'task_alt',
  CONNECTION_REQUEST: 'person_add',
  CONNECTION_ACCEPTED: 'how_to_reg',
};

const getIcon = (type) => NOTIFICATION_ICONS[type] || 'notifications';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem('token');
  const socketRef = useSocket(token);

  useEffect(() => {
    if (!token) return;

    const loadNotifications = async () => {
      try {
        const json = await fetchNotifications(token);
        if (json.success) {
          setNotifications(json.data);
          setUnreadCount(json.unreadCount);
        }
      } catch (err) {
        console.error('Failed to load notifications', err);
      }
    };

    loadNotifications();
  }, [token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('receive_notification', handleNotification);
    return () => socket.off('receive_notification', handleNotification);
  });

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const json = await markAsRead(token, [notificationId]);
      if (json.success) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const json = await markAllAsRead(token);
      if (json.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-slate-600 dark:text-white"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-[#1e293b]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fade-in-up max-h-100 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-500 hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="py-1">
            {notifications.length === 0 ? (
              <p className="px-4 py-3 text-sm text-center text-slate-500">Không có thông báo mới</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${n.isRead ? 'opacity-60' : 'bg-primary/5'}`}
                >
                  <div className="flex gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        {getIcon(n.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.content}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                    {!n.isRead && <div className="size-2 rounded-full bg-primary mt-1 shrink-0"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
