import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchChannels,
  fetchRoomMessages,
  setActiveRoom,
  receiveMessage,
} from '../../store/slices/chatSlice';
import {
  connectSocket,
  joinRoom,
  leaveRoom,
  sendSocketMessage,
  getSocket,
} from '../../services/socket';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Smile,
  Paperclip,
} from 'lucide-react';
import { toast } from 'sonner';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { channels, activeRoom, messages, loading } = useSelector((state) => state.chat);

  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    dispatch(fetchChannels());
    if (user) {
      const socket = connectSocket(user.id);

      socket.on('new_message', (msg) => {
        dispatch(receiveMessage(msg));
      });

      socket.on('user_typing', ({ userName, room }) => {
        if (room === activeRoom && !typingUsers.includes(userName)) {
          setTypingUsers((prev) => [...prev, userName]);
        }
      });

      socket.on('user_stop_typing', ({ room }) => {
        if (room === activeRoom) {
          setTypingUsers([]);
        }
      });
    }
  }, [dispatch, user, activeRoom]);

  useEffect(() => {
    if (activeRoom) {
      joinRoom(activeRoom);
      dispatch(fetchRoomMessages(activeRoom));
    }
    return () => {
      if (activeRoom) leaveRoom(activeRoom);
    };
  }, [dispatch, activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    sendSocketMessage({
      senderId: user.id,
      room: activeRoom,
      text: inputText.trim(),
    });

    setInputText('');
  };

  const currentChannel = channels.find((c) => c.id === activeRoom) || {
    title: '💬 Discussion Channel',
    description: 'Real-time peer & mentor collaboration',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[750px] flex flex-col md:flex-row">
      {/* Channels Sidebar */}
      <aside className="w-full md:w-72 bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Classrooms & Groups
          </h2>
          <p className="text-xs text-slate-400">Live chat rooms</p>
        </div>

        <div className="p-2 space-y-1 overflow-y-auto flex-1">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => dispatch(setActiveRoom(ch.id))}
              className={`w-full p-2.5 rounded-xl text-left flex items-center gap-2.5 text-xs font-semibold transition-colors ${
                activeRoom === ch.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Hash className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{ch.title}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* Room Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-500" />
              {currentChannel.title}
            </h3>
            <p className="text-xs text-slate-400">{currentChannel.description}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Socket Online
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading channel messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm">No messages yet in this room.</p>
              <p className="text-xs text-slate-500">Say hello to kick off the conversation!</p>
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
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div
                      className={`flex items-center gap-2 mb-1 text-[11px] ${
                        isMe ? 'justify-end' : ''
                      }`}
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {isMe ? 'You' : m.sender?.name || 'User'}
                      </span>
                      {m.sender?.role && (
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            m.sender?.role === 'instructor'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : m.sender?.role === 'admin'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {m.sender?.role}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Notification */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-1 text-xs italic text-indigo-500">
            {typingUsers.join(', ')} is typing...
          </div>
        )}

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            placeholder={`Message #${currentChannel.title}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md disabled:opacity-40 transition-transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;