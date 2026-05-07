import React, { useState, useEffect, useRef } from 'react';
import { getRecentChats, getChatHistory } from '../../services/chatService';
import { getMyConnections, searchUsersToConnect, sendConnectionRequest, acceptConnectionRequest } from '../../services/networkService';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Messaging = () => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'connections', 'discover'
  const [chats, setChats] = useState([]);
  const [connections, setConnections] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeChat, setActiveChat] = useState(null); // friend info
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId;

  const loadChats = async () => {
    try {
        const token = localStorage.getItem('token');
        setChats(await getRecentChats(token));
    } catch(err) { console.error(err); }
  }

  const loadConnections = async () => {
    try {
        const token = localStorage.getItem('token');
        setConnections(await getMyConnections(token));
    } catch(err) { console.error(err); }
  }

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if(val.length > 2) {
        const token = localStorage.getItem('token');
        const users = await searchUsersToConnect(token, val);
        setDiscoverUsers(users);
    } else {
        setDiscoverUsers([]);
    }
  }

  const handleConnect = async (user) => {
    try {
        const token = localStorage.getItem('token');
        await sendConnectionRequest(token, user.id);
        alert('Friend request sent!');
        setDiscoverUsers(discoverUsers.filter(u => u.id !== user.id));
    } catch(e) {
        alert(e.message);
    }
  };

  const openChat = async (friend) => {
    setActiveChat(friend);
    try {
        const token = localStorage.getItem('token');
        const history = await getChatHistory(token, friend.id);
        setMessages(history);
        scrollToBottom();
    } catch(err) { console.error(err); }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if(!newMessage.trim() || !activeChat) return;
    
    socketRef.current.emit('send_message', {
        receiverId: activeChat.id,
        content: newMessage
    });
    setNewMessage('');
    scrollToBottom();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
        // Init socket
        socketRef.current = io(API.replace('/v1',''), { auth: { token }});
        
        socketRef.current.on('receive_message', (msg) => {
            // Check if the message belongs to active chat
            setActiveChat(prevActiveChat => {
                if(prevActiveChat && (msg.senderId === prevActiveChat.id || msg.receiverId === prevActiveChat.id)) {
                    setMessages(prev => [...prev, msg]);
                }
                return prevActiveChat;
            });
            loadChats(); // Reload chats list to update recent message
        });
        
        loadChats();
        loadConnections();
    }
    return () => socketRef.current?.disconnect();
  }, []);

  return (
    <div className="bg-[#f9f9fb] text-[#0f111a] font-sans overflow-hidden h-screen flex flex-col relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6b7de1]/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#FDF8F2] rounded-full blur-[60px] -z-10 pointer-events-none"></div>

      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e8eaf2]/60 bg-white/75 backdrop-blur-md px-10 py-3 z-20">
          <a href="/" className="flex items-center gap-3 no-underline">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-2xl">diamond</span>
            </div>
            <h2 className="text-[#2d3748] dark:text-white text-xl font-bold tracking-tight">
              Korra<span className="font-light text-primary">Careers</span>
            </h2>
          </a>
          <a href="/feed" className="text-sm text-[#545d92] font-bold hover:text-[#6b7de1] transition-colors">Back to app</a>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 md:px-10 md:py-6 gap-6 max-w-[1600px] mx-auto w-full">
          <aside className="w-full md:w-[320px] lg:w-[380px] flex flex-col bg-white/75 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 h-full animate-[slideInLeft_0.5s_ease-out]">
              <div className="p-5 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-[#0f111a]">Networking</h2>
                  </div>
                  <div className="flex gap-2 mb-4">
                      <button onClick={()=>setActiveTab('chats')} className={`flex-1 pb-2 text-sm font-bold ${activeTab==='chats'?'border-b-2 border-[#6b7de1] text-[#6b7de1]':'text-gray-400'}`}>Chats</button>
                      <button onClick={()=>setActiveTab('connections')} className={`flex-1 pb-2 text-sm font-bold ${activeTab==='connections'?'border-b-2 border-[#6b7de1] text-[#6b7de1]':'text-gray-400'}`}>Friends</button>
                      <button onClick={()=>setActiveTab('discover')} className={`flex-1 pb-2 text-sm font-bold ${activeTab==='discover'?'border-b-2 border-[#6b7de1] text-[#6b7de1]':'text-gray-400'}`}>Discover</button>
                  </div>
                  {activeTab === 'discover' && (
                     <div className="relative w-full">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <span className="material-symbols-outlined text-[#545d92] text-[20px]">search</span>
                         </div>
                         <input value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7de1]/50" placeholder="Find people to connect..." />
                     </div>
                  )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {activeTab === 'chats' && chats.map(c => (
                      <div key={c.id} onClick={()=>openChat(c)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 cursor-pointer transition-colors border border-transparent hover:border-[#6b7de1]/10">
                          <div className="h-12 w-12 rounded-full border border-gray-100 flex items-center justify-center font-bold text-xl text-[#6b7de1] shrink-0 bg-white shadow-sm overflow-hidden">
                              {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full object-cover"/> : c.fullName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[#0f111a] font-medium truncate">{c.fullName}</p>
                              <p className="text-[#545d92]/80 text-sm truncate">{c.lastMessageContent}</p>
                          </div>
                      </div>
                  ))}

                  {activeTab === 'connections' && connections.map(f => (
                      <div key={f.id} onClick={()=>openChat(f)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 cursor-pointer transition-colors border border-transparent hover:border-[#6b7de1]/10">
                          <div className="h-12 w-12 rounded-full border border-gray-100 flex items-center justify-center font-bold text-xl text-[#6b7de1] shrink-0 bg-white">
                              {f.avatarUrl ? <img src={f.avatarUrl} className="w-full h-full object-cover"/> : f.fullName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[#0f111a] font-semibold truncate">{f.fullName}</p>
                              <p className="text-[#545d92] text-xs truncate">{f.headline || 'No headline'}</p>
                          </div>
                          <button className="material-symbols-outlined text-[#6b7de1] p-2">chat</button>
                      </div>
                  ))}

                  {activeTab === 'discover' && discoverUsers.map(u => (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 mb-2 border border-gray-100">
                          <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl text-white shrink-0 bg-gray-400">
                              {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full rounded-full object-cover"/> : u.fullName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-[#0f111a] font-semibold truncate">{u.fullName}</p>
                              <p className="text-[#545d92] text-xs truncate">{u.headline || 'Korra Member'}</p>
                          </div>
                          <button onClick={()=>handleConnect(u)} className="px-3 py-1 bg-[#6b7de1] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-105 transition-all">Connect</button>
                      </div>
                  ))}
              </div>
          </aside>

          <main className="hidden md:flex flex-1 flex-col bg-white/75 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 overflow-hidden">
              {activeChat ? (
                  <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/40 z-10">
                          <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full border border-gray-100 flex items-center justify-center font-bold text-xl text-[#6b7de1] shrink-0 bg-white">
                                  {activeChat.avatarUrl ? <img src={activeChat.avatarUrl} className="w-full h-full rounded-full object-cover"/> : activeChat.fullName.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="text-[#0f111a] text-lg font-bold leading-tight">{activeChat.fullName}</h3>
                                  <p className="text-[#545d92] text-xs font-medium uppercase trackging-wide">{activeChat.headline || 'Korra Connection'}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/80 text-[#545d92] transition-colors"><span className="material-symbols-outlined">call</span></button>
                              <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/80 text-[#545d92] transition-colors"><span class="material-symbols-outlined">videocam</span></button>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-white/20">
                          {messages.map((m, idx) => {
                              const isMe = m.senderId === currentUserId;
                              return (
                                  <div key={idx} className={`flex gap-3 max-w-[80%] animate-[fadeInUp_0.3s_ease-out] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                                      <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${isMe ? 'bg-[#6b7de1] text-white rounded-tr-none' : 'bg-[#FDF8F2] text-[#0f111a] rounded-tl-none border border-[#FDF8F2]'}`}>
                                          {m.content}
                                      </div>
                                  </div>
                              );
                          })}
                          <div ref={messagesEndRef} />
                      </div>

                      <div className="p-4 bg-white/60 border-t border-gray-100">
                          <form onSubmit={sendMessage} className="flex items-end gap-3 bg-white border border-gray-200 rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#6b7de1]/20 focus-within:border-[#6b7de1]/50 transition-all">
                              <button type="button" className="p-2 text-[#545d92] hover:bg-gray-100 rounded-lg shrink-0"><span className="material-symbols-outlined">attach_file</span></button>
                              <textarea 
                                value={newMessage} 
                                onChange={(e)=>setNewMessage(e.target.value)} 
                                onKeyDown={(e)=>{if(e.key==='Enter' && !e.shiftKey){sendMessage(e)}}}
                                className="flex-1 max-h-32 min-h-[44px] py-2.5 bg-transparent border-none resize-none focus:ring-0 text-[#0f111a] text-[15px]" 
                                placeholder="Type a message..." rows="1">
                              </textarea>
                              <div className="flex items-center gap-1 pb-1">
                                  <button type="submit" className="ml-1 h-10 w-10 bg-[#6b7de1] hover:bg-[#5a6bc7] text-white rounded-xl shadow-md flex items-center justify-center transition-all hover:scale-105">
                                      <span className="material-symbols-outlined text-[20px]">send</span>
                                  </button>
                              </div>
                          </form>
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                      <span className="material-symbols-outlined text-6xl text-[#6b7de1] mb-4">forum</span>
                      <p className="text-xl font-bold">Select a chat to start messaging</p>
                  </div>
              )}
          </main>
      </div>
    </div>
  );
};

export default Messaging;
