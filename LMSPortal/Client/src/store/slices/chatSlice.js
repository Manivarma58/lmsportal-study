import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  channels: [],
  activeRoom: 'general',
  messages: [],
  loading: false,
  error: null,
};

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

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
      state.messages = [];
    },
    receiveMessage: (state, action) => {
      // If message belongs to active room, append it
      if (action.payload.room === state.activeRoom) {
        state.messages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannels.fulfilled, (state, action) => {
        state.channels = action.payload;
      })
      .addCase(fetchRoomMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchRoomMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setActiveRoom, receiveMessage } = chatSlice.actions;
export default chatSlice.reducer;
