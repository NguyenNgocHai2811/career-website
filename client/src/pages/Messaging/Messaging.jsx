import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getRecentChats, getChatHistory } from '../../services/chatService';
import { getMyConnections, searchUsersToConnect, sendConnectionRequest } from '../../services/networkService';
import { io } from 'socket.io-client';
import AppHeader from '../../components/AppHeader/AppHeader';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Messaging = () => {
    const location = useLocation();
    const openChatUser = location.state?.openChatUser || null;
    const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'connections', 'discover'
    const [chats, setChats] = useState([]);
    const [connections, setConnections] = useState([]);
    const [discoverUsers, setDiscoverUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [activeChat, setActiveChat] = useState(null); // friend info
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

    const socketRef = useRef();
    const autoOpenedUserRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const isNearBottomRef = useRef(true);
    const [showViewNow, setShowViewNow] = useState(false);

    const currentUserId = JSON.parse(localStorage.getItem('user'))?.userId;

    const activeChatRef = useRef(activeChat);
    const currentUserIdRef = useRef(currentUserId);

    useEffect(() => {
        activeChatRef.current = activeChat;
        if (activeChat) setMobileView('chat');
    }, [activeChat]);

    useEffect(() => {
        currentUserIdRef.current = currentUserId;
    }, [currentUserId]);

    useEffect(() => {
        if (!openChatUser?.id) return;
        if (autoOpenedUserRef.current === String(openChatUser.id)) return;
        const fromChats = chats.find(c => String(c.id) === String(openChatUser.id));
        const fromConnections = connections.find(c => String(c.id) === String(openChatUser.id));
        const target = fromChats || fromConnections || openChatUser;
        autoOpenedUserRef.current = String(openChatUser.id);
        openChat(target);
        setActiveTab('chats');
    }, [openChatUser, chats, connections]);

    const loadChats = async () => {
        try {
            const token = localStorage.getItem('token');
            setChats(await getRecentChats(token));
        } catch (err) { console.error(err); }
    }

    const loadConnections = async () => {
        try {
            const token = localStorage.getItem('token');
            setConnections(await getMyConnections(token));
        } catch (err) { console.error(err); }
    }

    const handleSearch = async (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.length > 2) {
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
        } catch (e) {
            alert(e.message);
        }
    };

    const openChat = async (friend) => {
        setActiveChat(friend);
        try {
            const token = localStorage.getItem('token');
            const history = await getChatHistory(token, friend.id);
            setMessages(history);
            isNearBottomRef.current = true;
            setShowViewNow(false);
            scrollToBottom('auto');
        } catch (err) { console.error(err); }
    };

    const isNearBottom = () => {
        const el = messagesContainerRef.current;
        if (!el) return true;
        const threshold = 120;
        return el.scrollHeight - (el.scrollTop + el.clientHeight) <= threshold;
    };

    const scrollToBottom = (behavior = 'smooth') => {
        const el = messagesContainerRef.current;
        if (!el) return;
        requestAnimationFrame(() => {
            el.scrollTo({ top: el.scrollHeight, behavior });
            isNearBottomRef.current = true;
            setShowViewNow(false);
        });
    };

    const handleMessagesScroll = () => {
        const nearBottom = isNearBottom();
        isNearBottomRef.current = nearBottom;
        setShowViewNow(!nearBottom);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        const messageContent = newMessage.trim();
        const optimisticMessage = {
            messageId: `temp-${Date.now()}`,
            content: messageContent,
            senderId: currentUserIdRef.current,
            receiverId: activeChat.id,
            createdAt: new Date().toISOString()
        };

        if (socketRef.current?.connected) {
            socketRef.current.emit('send_message', {
                receiverId: activeChat.id,
                content: messageContent
            });
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');
            scrollToBottom();
        } else {
            console.error('Socket not connected');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const socketUrl = API.replace('/v1', '');
            socketRef.current = io(socketUrl, { auth: { token } });

            socketRef.current.on('connect', () => console.log('Socket connected'));
            socketRef.current.on('online_users', (ids) => setOnlineUsers(new Set(ids)));
            socketRef.current.on('user_online', ({ userId }) => setOnlineUsers(prev => new Set(prev).add(userId)));
            socketRef.current.on('user_offline', ({ userId }) => setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            }));

            socketRef.current.on('receive_message', (msg) => {
                const currentActiveChat = activeChatRef.current;
                if (currentActiveChat && (msg.senderId == currentActiveChat.id || msg.receiverId == currentActiveChat.id)) {
                    setMessages(prev => {
                        if (prev.some(m => m.messageId === msg.messageId)) return prev;
                        const replaced = prev.map(m => (m.messageId?.toString().startsWith('temp-') && m.senderId === msg.senderId && m.content === msg.content) ? { ...msg } : m);
                        if (replaced.some(m => m.messageId === msg.messageId)) return replaced;
                        return [...prev, msg];
                    });
                    if (isNearBottomRef.current) {
                        scrollToBottom();
                    } else {
                        setShowViewNow(true);
                    }
                }
                loadChats();
            });

            loadChats();
            loadConnections();
        }
        return () => socketRef.current?.disconnect();
    }, []);

    return (
        <div className="bg-[#f8fafc] dark:bg-[#0f172a] text-slate-900 dark:text-white min-h-screen h-screen flex flex-col font-sans overflow-hidden">
            <AppHeader activeTab="messages" />

            <main className="flex-1 min-h-0 flex overflow-hidden max-w-[1440px] mx-auto w-full relative">
                {/* Conversations Sidebar */}
                <aside className={`
                    ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
                    w-full md:w-[350px] lg:w-[400px] flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b] z-20 transition-all duration-300
                `}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold">Messages</h1>
                            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">edit_square</span>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                            <input 
                                type="text"
                                placeholder="Search messages..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex border-b border-gray-100 dark:border-gray-800 p-2 gap-1">
                        {['chats', 'connections', 'discover'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {activeTab === 'chats' && (
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {chats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => openChat(chat)}
                                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${activeChat?.id === chat.id ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="size-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                                {chat.avatarUrl ? <img src={chat.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{chat.fullName[0]}</span>}
                                            </div>
                                            {onlineUsers.has(chat.id) && <div className="absolute -bottom-1 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1e293b]"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="text-sm font-bold truncate">{chat.fullName}</h4>
                                                <span className="text-[10px] text-slate-400 font-medium">12:30 PM</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate font-medium">{chat.lastMessage || 'Start a conversation'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="p-2 space-y-1">
                                {connections.map(conn => (
                                    <div key={conn.id} onClick={() => openChat(conn)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all">
                                        <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center overflow-hidden border border-primary/10">
                                            {conn.avatarUrl ? <img src={conn.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-primary font-bold">{conn.fullName[0]}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold truncate">{conn.fullName}</h4>
                                            <p className="text-[10px] text-slate-500 truncate">{conn.headline || 'Connection'}</p>
                                        </div>
                                        <div className="size-8 rounded-full flex items-center justify-center text-primary/40">
                                            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'discover' && (
                            <div className="p-3 space-y-3">
                                {discoverUsers.map(u => (
                                    <div key={u.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="size-12 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm flex items-center justify-center">
                                                {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : u.fullName[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold truncate">{u.fullName}</h4>
                                                <p className="text-xs text-slate-500 truncate">{u.role || 'Professional'}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleConnect(u)} className="w-full py-2 bg-primary text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Connect</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Chat Area */}
                <section className={`
                    ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
                    flex-1 min-h-0 flex-col bg-[#f8fafc] dark:bg-[#0f172a] relative transition-all duration-300
                `}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="flex-none h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md z-10 sticky top-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setMobileView('list')} className="md:hidden size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-500">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <div className="relative">
                                        <div className="size-10 md:size-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                                            {activeChat.avatarUrl ? <img src={activeChat.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-primary">{activeChat.fullName[0]}</span>}
                                        </div>
                                        {onlineUsers.has(activeChat.id) && <div className="absolute -bottom-1 -right-1 size-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#1e293b]"></div>}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm md:text-base font-bold truncate">{activeChat.fullName}</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-medium">{onlineUsers.has(activeChat.id) ? 'Active now' : 'Away'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 md:gap-2">
                                    <button className="size-9 md:size-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-400 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">videocam</span>
                                    </button>
                                    <button className="size-9 md:size-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-400 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">call</span>
                                    </button>
                                    <button className="size-9 md:size-11 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-400 flex items-center justify-center transition-colors">
                                        <span className="material-symbols-outlined text-[20px] md:text-[24px]">more_vert</span>
                                    </button>
                                </div>
                            </header>

                            {/* Messages List */}
                            <div className="relative flex-1 min-h-0">
                                <div
                                    ref={messagesContainerRef}
                                    onScroll={handleMessagesScroll}
                                    className="h-full overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar bg-bubbles"
                                >
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.senderId == currentUserId;
                                        const showDate = idx === 0 || new Date(msg.createdAt).toLocaleDateString() !== new Date(messages[idx-1].createdAt).toLocaleDateString();
                                        
                                        return (
                                            <React.Fragment key={msg.messageId || idx}>
                                                {showDate && (
                                                    <div className="flex justify-center my-6">
                                                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}>
                                                    <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-gray-100 dark:border-gray-700'}`}>
                                                            {msg.content}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 mt-1.5 font-medium px-1">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                                {showViewNow && (
                                    <button
                                        type="button"
                                        onClick={() => scrollToBottom()}
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-all"
                                    >
                                        View now
                                    </button>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="flex-none p-4 md:p-6 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
                                <form onSubmit={sendMessage} className="flex items-center gap-3 max-w-[1000px] mx-auto w-full">
                                    <button type="button" className="shrink-0 size-10 md:size-12 rounded-xl bg-gray-50 dark:bg-gray-800 text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="w-full pl-4 pr-12 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">mood</span>
                                        </button>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!newMessage.trim()}
                                        className="shrink-0 size-10 md:size-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <div className="size-24 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mb-6 shadow-inner">
                                <span className="material-symbols-outlined text-5xl">forum</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Your Workspace Chat</h2>
                            <p className="text-slate-500 dark:text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                                Select a conversation to start collaborating with your team or connections. All messages are secure and encrypted.
                            </p>
                            <button onClick={() => setMobileView('list')} className="md:hidden mt-8 px-6 py-2.5 bg-primary text-white rounded-xl font-bold">
                                View Conversations
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Messaging;
