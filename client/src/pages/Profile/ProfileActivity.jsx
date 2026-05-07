import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfileActivity = ({ userId, token, isOwner, profileData }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All'); // All, Reactions, Comments, Shares

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const targetId = userId || profileData?.userId;
        if (!targetId || targetId === 'me') {
           setLoading(false);
           return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/v1/users/${targetId}/activities`, { headers });
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileData) fetchActivities();
  }, [userId, profileData, token]);

  if (loading) return (
    <div className="flex justify-center p-8">
      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">⚠️ {error}</div>
  );

  const getFilterStyle = (f) => {
    if (filter === f) {
      return "px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-sm transition-all";
    }
    return "px-4 py-2 bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-2 flex gap-2 items-center overflow-x-auto no-scrollbar">
        <button onClick={() => setFilter('All')} className={getFilterStyle('All')}>All Activity</button>
        <button onClick={() => setFilter('Reactions')} className={getFilterStyle('Reactions')}>Reactions</button>
        <button onClick={() => setFilter('Comments')} className={getFilterStyle('Comments')}>Comments</button>
        <button onClick={() => setFilter('Shares')} className={getFilterStyle('Shares')}>Shares</button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center text-slate-500">
            No activity to show yet.
          </div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 animate-fade-in-up">
              <div className="flex gap-3 mb-2">
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'like' ? 'bg-pastel-blue/20 text-primary' : activity.type === 'comment' ? 'bg-secondary/20 text-secondary' : 'bg-tertiary/20 text-tertiary'}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {activity.type === 'like' ? 'thumb_up' : activity.type === 'comment' ? 'comment' : 'person_add'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        <span className="font-bold">{profileData?.fullName || 'User'}</span> {activity.actionText}
                      </p>
                      <span className="text-xs text-slate-400">{new Date(activity.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="ml-13 pl-10 border-l-2 border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-300">{activity.contentPreview}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileActivity;
