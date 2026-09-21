import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchConversations,
  fetchContacts,
  fetchChannels,
  fetchDirectMessages,
  fetchRoomMessages,
  setActiveRecipient,
  setActiveRoom,
  setActiveChatType,
  receiveDirectMessage,
  receiveMessage,
  setOnlineUsers,
  updateUserStatus,
  messagesWereRead,
  setTypingStatus,
  markDirectRead,
} from '../../store/slices/chatSlice';
import {
  getSocket,
  connectSocket,
  sendDirectMessage,
  markReadDirect,
  sendTypingDirect,
  sendStopTypingDirect,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
} from '../../services/socket';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Search,
  Check,
  CheckCheck,
  Plus,
  X,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    conversations,
    contacts,
    activeChatType,
    activeRecipient,
    directMessages,
    channels,
    activeRoom,
    messages,
    onlineUserIds,
    typingUsers,
    loading,
  } = useSelector((state) => state.chat);

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [isConnected, setIsConnected] = useState(() => Boolean(getSocket()?.connected));

  const messagesEndRef = useRef(null);
  const activeRecipientRef = useRef(activeRecipient);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    activeRecipientRef.current = activeRecipient;
  }, [activeRecipient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [directMessages, messages]);

  // Initial data fetching & Socket event binding
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchContacts());
    dispatch(fetchChannels());

    const socket = connectSocket();

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleDirectMessage = (msg) => {
      dispatch(receiveDirectMessage(msg));
      const current = activeRecipientRef.current;
      const isFromActive =
        current &&
        (msg.sender?._id === current._id || msg.sender === current._id);

      if (isFromActive && socket) {
        markReadDirect(msg._id, msg.sender?._id || msg.sender);
      }
    };

    const handleRoomMessage = (msg) => {
      dispatch(receiveMessage(msg));
    };

    const handleOnlineUsers = (ids) => {
      dispatch(setOnlineUsers(ids));
    };

    const handleUserStatusChange = (data) => {
      dispatch(updateUserStatus(data));
    };

    const handleMessagesRead = (data) => {
      dispatch(messagesWereRead(data));
    };

    const handleTypingDirect = ({ senderId }) => {
      dispatch(setTypingStatus({ userId: senderId, isTyping: true }));
    };

    const handleStopTypingDirect = ({ senderId }) => {
      dispatch(setTypingStatus({ userId: senderId, isTyping: false }));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('direct_message', handleDirectMessage);
    socket.on('receive_message', handleRoomMessage);
    socket.on('online_users', handleOnlineUsers);
    socket.on('user_status_change', handleUserStatusChange);
    socket.on('messages_read', handleMessagesRead);
    socket.on('typing_direct', handleTypingDirect);
    socket.on('stop_typing_direct', handleStopTypingDirect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('direct_message', handleDirectMessage);
      socket.off('receive_message', handleRoomMessage);
      socket.off('online_users', handleOnlineUsers);
      socket.off('user_status_change', handleUserStatusChange);
      socket.off('messages_read', handleMessagesRead);
      socket.off('typing_direct', handleTypingDirect);
      socket.off('stop_typing_direct', handleStopTypingDirect);
    };
  }, [dispatch]);

  // Load messages when recipient changes
  useEffect(() => {
    if (activeChatType === 'direct' && activeRecipient?._id) {
      dispatch(fetchDirectMessages(activeRecipient._id));
      dispatch(markDirectRead(activeRecipient._id));
      markReadDirect(null, activeRecipient._id);
    }
  }, [dispatch, activeChatType, activeRecipient]);

  // Load channel messages
  useEffect(() => {
    if (activeChatType === 'channel' && activeRoom) {
      dispatch(fetchRoomMessages(activeRoom));
      joinRoom(activeRoom);
      return () => {
        leaveRoom(activeRoom);
      };
    }
  }, [dispatch, activeChatType, activeRoom]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    if (activeChatType === 'direct') {
      if (!activeRecipient?._id) {
        toast.error('Select a recipient to start messaging.');
        return;
      }
      sendDirectMessage(activeRecipient._id, text);
      sendStopTypingDirect(activeRecipient._id);
    } else {
      if (!activeRoom) {
        toast.error('Select a channel room to chat.');
        return;
      }
      sendSocketMessage({
        room: activeRoom,
        message: text,
      });
    }

    setInputText('');
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (activeChatType === 'direct' && activeRecipient?._id) {
      sendTypingDirect(activeRecipient._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTypingDirect(activeRecipient._id);
      }, 1500);
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.partner?.name?.toLowerCase().includes(q) ||
        c.lastMessage?.text?.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  const isPartnerOnline =
    activeRecipient?._id && onlineUserIds.includes(activeRecipient._id.toString());
  const isPartnerTyping =
    activeRecipient?._id && !!typingUsers[activeRecipient._id.toString()];

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden h-[760px] flex flex-col md:flex-row text-slate-800 antialiased">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-full md:w-80 lg:w-96 bg-slate-50/70 border-r border-slate-200/80 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Messages</h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                    : 'bg-amber-50 text-amber-700 border-amber-200/70'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                ></span>
                {isConnected ? 'Live' : 'Reconnecting'}
              </span>

              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                title="Start new conversation"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs: Direct vs Channels */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-xl mb-3">
            <button
              onClick={() => dispatch(setActiveChatType('direct'))}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChatType === 'direct'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Direct Chats</span>
              {totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                  {totalUnreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => dispatch(setActiveChatType('channel'))}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeChatType === 'channel'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Channels</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={activeChatType === 'direct' ? 'Search direct conversations...' : 'Search channels...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeChatType === 'direct' ? (
            filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No direct messages yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connect with instructors or peer scholars.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-3 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.partner;
                const isSelected = activeRecipient?._id === partner?._id;
                const isOnline = onlineUserIds.includes(partner?._id?.toString());
                const isMyLastMsg = conv.lastMessage?.senderId === user?.id;

                return (
                  <div
                    key={partner?._id}
                    onClick={() => dispatch(setActiveRecipient(partner))}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                        : 'border-transparent hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={
                          partner?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                        }
                        alt={partner?.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      ></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-xs truncate text-slate-900">
                            {partner?.name}
                          </span>
                          {partner?.role && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {partner.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatTimestamp(conv.lastMessage?.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate">
                          {isMyLastMsg && <span className="text-slate-400">You: </span>}
                          {conv.lastMessage?.text || 'No messages yet'}
                        </p>

                        {conv.unreadCount > 0 ? (
                          <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shrink-0">
                            {conv.unreadCount}
                          </span>
                        ) : isMyLastMsg ? (
                          <span className="shrink-0 text-slate-400">
                            {conv.lastMessage?.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => dispatch(setActiveRoom(ch.id))}
                className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 text-xs font-semibold transition-all border ${
                  activeRoom === ch.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'border-transparent text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="truncate block font-bold">{ch.title}</span>
                  <span className="text-[10px] opacity-75 truncate block">
                    {ch.description}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ================= RIGHT MAIN AREA: MESSAGE WINDOW ================= */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {activeChatType === 'direct' ? (
          activeRecipient ? (
            <>
              {/* Header */}
              <div className="p-4 px-6 border-b border-slate-200/80 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={
                        activeRecipient.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'
                      }
                      alt={activeRecipient.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    ></span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {activeRecipient.name}
                      </h3>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {activeRecipient.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isPartnerOnline ? (
                        <span className="text-emerald-600 flex items-center gap-1 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active now
                        </span>
                      ) : (
                        <span>Offline • Messages delivered securely</span>
                      )}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-500 font-mono hidden sm:block">
                  {activeRecipient.headline || 'NOVA Verified Member'}
                </span>
              </div>

              {/* Direct Messages Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {loading && directMessages.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading message history...
                  </div>
                ) : directMessages.length === 0 ? (
                  <div className="p-16 text-center text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mx-auto flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Start your conversation with {activeRecipient.name}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Ask questions about assignments, project reviews, or discuss curriculum topics in real time.
                    </p>
                  </div>
                ) : (
                  directMessages.map((m) => {
                    const isMe =
                      m.sender?._id === user?.id ||
                      m.sender === user?.id ||
                      m.sender?._id === user?._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex gap-3 max-w-[80%] sm:max-w-[70%] ${
                          isMe ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        {!isMe && (
                          <img
                            src={
                              m.sender?.avatar ||
                              activeRecipient.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                            }
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover shrink-0 mt-1 border border-slate-200"
                          />
                        )}

                        <div className="space-y-1">
                          <div
                            className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isMe
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                            }`}
                          >
                            {m.message || m.text}
                          </div>

                          <div
                            className={`flex items-center gap-1.5 text-[10px] text-slate-400 ${
                              isMe ? 'justify-end' : ''
                            }`}
                          >
                            <span>
                              {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            {isMe && (
                              <span title={m.read ? 'Read' : 'Sent'}>
                                {m.read ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Notification */}
              {isPartnerTyping && (
                <div className="px-6 py-1 text-xs text-blue-600 flex items-center gap-1.5 animate-pulse bg-blue-50/50">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span>{activeRecipient.name} is typing...</span>
                </div>
              )}

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeRecipient.name}... (Press Enter to send)`}
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No conversation selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Choose a conversation from the sidebar or start a new message with an instructor.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Start Direct Message
              </button>
            </div>
          )
        ) : (
          /* Channels Stream */
          <>
            <div className="p-4 px-6 border-b border-slate-200/80 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  {channels.find((c) => c.id === activeRoom)?.title || 'General Discussion'}
                </h3>
                <p className="text-xs text-slate-500">
                  {channels.find((c) => c.id === activeRoom)?.description ||
                    'Community discussion channel'}
                </p>
              </div>
              <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Socket Live
              </span>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Hash className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Channel quiet</p>
                  <p className="text-xs text-slate-500">Be the first to share an insight here.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender?._id === user?.id || m.sender === user?.id;

                  return (
                    <div
                      key={m._id}
                      className={`flex gap-3 max-w-[80%] ${
                        isMe ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <img
                        src={
                          m.sender?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                        }
                        alt=""
                        className="w-8 h-8 rounded-xl object-cover shrink-0 mt-1 border border-slate-200"
                      />
                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                            isMe ? 'justify-end' : ''
                          }`}
                        >
                          <span className="font-bold text-slate-700">
                            {isMe ? 'You' : m.sender?.name}
                          </span>
                          <span>
                            {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                              : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                          }`}
                        >
                          {m.message || m.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Channel Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-200/80 bg-white flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Post to channel room... (Press Enter to send)"
                value={inputText}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </main>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Message</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search instructors or students..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredContacts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No users found.</p>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => {
                      dispatch(setActiveChatType('direct'));
                      dispatch(setActiveRecipient(contact));
                      setShowNewChatModal(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <img
                      src={
                        contact.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                      }
                      alt={contact.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {contact.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {contact.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {contact.email}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;