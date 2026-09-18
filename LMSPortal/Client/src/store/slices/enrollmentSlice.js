import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  myEnrollments: [],
  currentEnrollment: null,
  isEnrolledInCurrent: false,
  progressPercentage: 0,
  completedLessonIds: [],
  latestCertificate: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchMyEnrollments = createAsyncThunk(
  'enrollments/fetchMyEnrollments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/enrollments/my-courses');
      return res.data.enrollments;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'enrollments/enrollInCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/enrollments/${courseId}`);
      return res.data.enrollment;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const checkEnrollmentStatus = createAsyncThunk(
  'enrollments/checkEnrollmentStatus',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/enrollments/check/${courseId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCourseProgress = createAsyncThunk(
  'enrollments/fetchCourseProgress',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/progress/${courseId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleLessonProgress = createAsyncThunk(
  'enrollments/toggleLessonProgress',
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try {
      const res = await API.post(`/progress/${courseId}/lesson/${lessonId}`);
      return { lessonId, ...res.data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
      state.isEnrolledInCurrent = false;
      state.progressPercentage = 0;
      state.completedLessonIds = [];
      state.latestCertificate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Enrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.myEnrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enroll
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.isEnrolledInCurrent = true;
        state.myEnrollments.unshift(action.payload);
      })
      // Check Status
      .addCase(checkEnrollmentStatus.fulfilled, (state, action) => {
        state.isEnrolledInCurrent = action.payload.isEnrolled;
        state.currentEnrollment = action.payload.enrollment;
      })
      // Fetch Progress
      .addCase(fetchCourseProgress.fulfilled, (state, action) => {
        state.progressPercentage = action.payload.progressPercentage;
        state.completedLessonIds = action.payload.completedLessonIds || [];
        state.latestCertificate = action.payload.certificate || null;
      })
      // Toggle Lesson Progress
      .addCase(toggleLessonProgress.fulfilled, (state, action) => {
        state.progressPercentage = action.payload.progressPercentage;
        const id = action.payload.lessonId;
        if (state.completedLessonIds.includes(id)) {
          state.completedLessonIds = state.completedLessonIds.filter((l) => l !== id);
        } else {
          state.completedLessonIds.push(id);
        }
        if (action.payload.certificate) {
          state.latestCertificate = action.payload.certificate;
        }
      });
  },
});

export const { clearCurrentEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
