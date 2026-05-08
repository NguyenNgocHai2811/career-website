import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppHeader from '../../components/AppHeader/AppHeader';
import { getMyConnections, getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../services/networkService';

const MyNetwork = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [connections, setConnections] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeTab = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab');
  }, [location.search]);

  const fetchNetwork = async () => {
    try {
      const token = localStorage.getItem('token');
      const [connData, pendData] = await Promise.all([
        getMyConnections(token),
        getPendingRequests(token)
      ]);
      setConnections(connData);
      setPending(pendData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  useEffect(() => {
    if (activeTab === 'invitations') {
      const el = document.getElementById('invitations');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab, pending.length]);

  const handleAccept = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await acceptConnectionRequest(token, senderId);
      // Refresh
      fetchNetwork();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReject = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await rejectConnectionRequest(token, senderId);
      // Refresh
      fetchNetwork();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="bg-[#FEF9F3] min-h-screen text-[#1D1B18] font-sans pb-20">
      <AppHeader />
      <div className="max-w-[1200px] mx-auto pt-28 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-[fadeInUp_0.5s_ease-out]">
        
        {/* Left Sidebar */}
        <aside className="lg:col-span-1 border border-[#ece7e2] bg-white rounded-2xl shadow-sm p-6 self-start">
          <h2 className="font-bold text-lg mb-4">Manage my network</h2>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-gray-500 hover:text-primary cursor-pointer p-2 rounded hover:bg-[#F8F3ED] transition-colors">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">group</span>
                <span className="font-medium">Connections</span>
              </div>
              <span className="font-bold">{connections.length}</span>
            </li>
            <li className="flex items-center justify-between text-gray-500 hover:text-primary cursor-pointer p-2 rounded hover:bg-[#F8F3ED] transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="material-symbols-outlined">person_add</span>
                   <span className="font-medium">Pendings</span>
                 </div>
                 <span className="font-bold">{pending.length}</span>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Pending Invitations */}
          {pending.length > 0 && (
            <div
              id="invitations"
              className={`bg-white rounded-2xl p-6 shadow-sm border ${activeTab === 'invitations' ? 'border-primary/40 ring-2 ring-primary/10' : 'border-[#ece7e2]'}`}
            >
               <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                 <h2 className="text-xl font-bold font-serif">Invitations</h2>
                 <span className="text-sm font-bold text-primary">Manage</span>
               </div>
               <div className="divide-y divide-gray-100">
                 {pending.map(req => (
                   <div key={req.id} className="py-4 flex items-center gap-4">
                     <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-gray-100 cursor-pointer" onClick={() => navigate(`/profile/${req.id}`)}>
                        {req.avatarUrl ? <img src={req.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-50">{req.fullName?.charAt(0)}</div>}
                     </div>
                     <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${req.id}`)}>
                       <p className="font-bold hover:text-primary transition-colors">{req.fullName}</p>
                       <p className="text-sm text-gray-500 truncate">{req.headline || 'Looking for connections'}</p>
                     </div>
                     <div className="flex items-center gap-3">
                       <button onClick={() => handleReject(req.id)} className="font-bold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">Ignore</button>
                       <button onClick={() => handleAccept(req.id)} className="font-bold text-primary border-2 border-primary hover:bg-primary/5 px-4 py-1.5 rounded-full transition-colors">Accept</button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* Connections List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ece7e2]">
             <h2 className="text-xl font-bold font-serif mb-6">Your Connections</h2>
             {loading ? (
               <p className="text-center font-bold text-gray-500 py-10">Đang tải...</p>
             ) : connections.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {connections.map(user => (
                   <div key={user.id} className="border border-gray-100 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                     <div className="h-16 w-full absolute top-0 left-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
                     <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-4 border-white bg-gray-50 relative z-10 mx-auto mt-4 mb-3">
                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500 bg-gray-50">{user.fullName?.charAt(0)}</div>}
                     </div>
                     <h3 className="font-bold group-hover:underline">{user.fullName}</h3>
                     <p className="text-xs text-gray-500 line-clamp-2 mt-1 px-2">{user.headline || 'Member'}</p>
                     <button className="mt-4 w-full border border-primary text-primary hover:bg-primary/5 font-bold py-1.5 rounded-full transition-colors">
                       Message
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">group_off</span>
                  <p className="font-bold text-gray-500">You don't have any connections yet.</p>
                  <p className="text-sm text-gray-400 mt-2">Start exploring and send requests to build your professional network.</p>
                </div>
             )}
          </div>
        </main>

      </div>
    </div>
  );
};

export default MyNetwork;
