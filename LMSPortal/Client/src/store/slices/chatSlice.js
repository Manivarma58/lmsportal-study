import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  // Direct Messaging
  conversations: [],
  contacts: [],
  activeChatType: 'direct', // 'direct' | 'channel'
  activeRecipient: null, // Partner user object
  directMessages: [],

  // Channels / Group rooms
  channels: [],
  activeRoom: 'general',
  messages: [],

  // Presence & Typing
  onlineUserIds: [],
  typingUsers: {}, // { [userId]: boolean }

  loading: false,
  error: null,
};

// Async Thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/chat/conversations');
      return res.data.conversations;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDirectMessages = createAsyncThunk(
  'chat/fetchDirectMessages',
  async (recipientId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/chat/direct/${recipientId}`);
      return { recipientId, messages: res.data.messages };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchContacts = createAsyncThunk(
  'chat/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/chat/contacts');
      return res.data.contacts;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchChannels = createAsyncThunk(
  'chat/fetchChannels',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/chat/channels');
      return res.data.channels;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRoomMessages = createAsyncThunk(
  'chat/fetchRoomMessages',
  async (room, { rejectWithValue }) => {
    try {
      const res = await API.get(`/chat/room/${room}`);
      return { room, messages: res.data.messages };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markDirectRead = createAsyncThunk(
  'chat/markDirectRead',
  async (senderId, { rejectWithValue }) => {
    try {
      await API.put(`/chat/read/${senderId}`);
      return senderId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChatType: (state, action) => {
      state.activeChatType = action.payload;
    },
    setActiveRecipient: (state, action) => {
      state.activeRecipient = action.payload;
      state.activeChatType = 'direct';
      // Clear unread count for this partner in conversations
      if (action.payload && action.payload._id) {
        const conv = state.conversations.find(
          (c) => c.partner?._id === action.payload._id
        );
        if (conv) conv.unreadCount = 0;
      }
    },
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.activeChatType = 'channel';
      state.messages = [];
    },
    receiveDirectMessage: (state, action) => {
      const msg = action.payload;
      const partnerId = state.activeRecipient?._id;

      // If active conversation matches either sender or receiver of this message, append it
      const belongsToActive =
        partnerId &&
        (msg.sender?._id === partnerId || msg.receiver?._id === partnerId);

      if (belongsToActive) {
        state.directMessages.push(msg);
      }

      // Update conversations list summary
      const otherUser =
        msg.sender?._id === partnerId ? msg.sender : msg.receiver;
      const otherUserId =
        msg.sender?._id === state.activeRecipient?._id
          ? msg.sender?._id
          : msg.receiver?._id;

      const convIndex = state.conversations.findIndex(
        (c) =>
          c.partner?._id === msg.sender?._id ||
          c.partner?._id === msg.receiver?._id
      );

      const isCurrentActive =
        state.activeChatType === 'direct' &&
        state.activeRecipient?._id === msg.sender?._id;

      if (convIndex >= 0) {
        const conv = state.conversations[convIndex];
        conv.lastMessage = {
          id: msg._id,
          text: msg.message || msg.text || '',
          timestamp: msg.timestamp || msg.createdAt,
          senderId: msg.sender?._id,
          read: isCurrentActive ? true : msg.read,
        };
        if (!isCurrentActive && msg.sender?._id !== partnerId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        // Move to top of conversations list
        state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      } else {
        // Create new conversation entry if not exists
        const partner = msg.sender?._id === state.activeRecipient?._id ? msg.sender : msg.receiver;
        if (partner) {
          state.conversations.unshift({
            partner: {
              _id: partner._id,
              name: partner.name,
              avatar: partner.avatar,
              role: partner.role,
              headline: partner.headline || '',
              isOnline: state.onlineUserIds.includes(partner._id?.toString()),
            },
            lastMessage: {
              id: msg._id,
              text: msg.message || msg.text || '',
              timestamp: msg.timestamp || msg.createdAt,
              senderId: msg.sender?._id,
              read: isCurrentActive ? true : msg.read,
            },
            unreadCount: isCurrentActive ? 0 : 1,
          });
        }
      }
    },
    receiveMessage: (state, action) => {
      if (action.payload.room === state.activeRoom) {
        state.messages.push(action.payload);
      }
    },
    setOnlineUsers: (state, action) => {
      const ids = (action.payload || []).map((id) => id.toString());
      state.onlineUserIds = ids;

      // Update online flag in conversations
      state.conversations.forEach((conv) => {
        if (conv.partner?._id) {
          conv.partner.isOnline = ids.includes(conv.partner._id.toString());
        }
      });

      // Update online flag in contacts
      state.contacts.forEach((contact) => {
        if (contact._id) {
          contact.isOnline = ids.includes(contact._id.toString());
        }
      });

      // Update active recipient
      if (state.activeRecipient?._id) {
        state.activeRecipient.isOnline = ids.includes(
          state.activeRecipient._id.toString()
        );
      }
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      const idStr = userId.toString();
      const isOnline = status === 'online';

      if (isOnline) {
        if (!state.onlineUserIds.includes(idStr)) {
          state.onlineUserIds.push(idStr);
        }
      } else {
        state.onlineUserIds = state.onlineUserIds.filter((id) => id !== idStr);
      }

      state.conversations.forEach((conv) => {
        if (conv.partner?._id && conv.partner._id.toString() === idStr) {
          conv.partner.isOnline = isOnline;
        }
      });

      state.contacts.forEach((contact) => {
        if (contact._id && contact._id.toString() === idStr) {
          contact.isOnline = isOnline;
        }
      });

      if (state.activeRecipient?._id && state.activeRecipient._id.toString() === idStr) {
        state.activeRecipient.isOnline = isOnline;
      }
    },
    messagesWereRead: (state, action) => {
      const { readerId } = action.payload;
      // If currently chatting with this reader, mark all messages as read
      if (state.activeRecipient?._id === readerId) {
        state.directMessages.forEach((m) => {
          m.read = true;
        });
      }
      // Update in conversations list
      const conv = state.conversations.find((c) => c.partner?._id === readerId);
      if (conv && conv.lastMessage) {
        conv.lastMessage.read = true;
      }
    },
    setTypingStatus: (state, action) => {
      const { senderId, isTyping } = action.payload;
      if (senderId) {
        state.typingUsers[senderId] = isTyping;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Conversations
    builder.addCase(fetchConversations.fulfilled, (state, action) => {
      state.conversations = action.payload;
    });

    // Fetch Direct Messages
    builder.addCase(fetchDirectMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDirectMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.directMessages = action.payload.messages;
    });
    builder.addCase(fetchDirectMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Fetch Contacts
    builder.addCase(fetchContacts.fulfilled, (state, action) => {
      state.contacts = action.payload;
    });

    // Fetch Channels
    builder.addCase(fetchChannels.fulfilled, (state, action) => {
      state.channels = action.payload;
    });

    // Fetch Room Messages
    builder.addCase(fetchRoomMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRoomMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload.messages;
    });
    builder.addCase(fetchRoomMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Mark Direct Read
    builder.addCase(markDirectRead.fulfilled, (state, action) => {
      const senderId = action.payload;
      const conv = state.conversations.find((c) => c.partner?._id === senderId);
      if (conv) conv.unreadCount = 0;
    });
  },
});

export const {
  setActiveChatType,
  setActiveRecipient,
  setActiveRoom,
  receiveDirectMessage,
  receiveMessage,
  setOnlineUsers,
  updateUserStatus,
  messagesWereRead,
  setTypingStatus,
} = chatSlice.actions;

export default chatSlice.reducer;
