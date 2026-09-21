import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (limit = 50, { rejectWithValue }) => {
    try {
      const res = await API.get(`/notifications?limit=${limit}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await API.put(`/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await API.put('/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNotificationById = createAsyncThunk(
  'notifications/deleteNotificationById',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Avoid duplicate notification if already received
      const exists = state.notifications.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark single read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const found = state.notifications.find((n) => n._id === action.payload);
        if (found) {
          const wasUnread = !found.read && !found.isRead;
          found.read = true;
          found.isRead = true;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })

      // Mark all read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.read = true;
          n.isRead = true;
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotificationById.fulfilled, (state, action) => {
        const found = state.notifications.find((n) => n._id === action.payload);
        if (found && (!found.read && !found.isRead)) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter((n) => n._id !== action.payload);
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
