import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../services/api';

const initialState = {
  courses: [],
  featuredCourses: [],
  categories: [],
  currentCourse: null,
  instructorCourses: [],
  total: 0,
  page: 1,
  pages: 1,
  filters: {
    keyword: '',
    category: 'All',
    level: 'All',
    price: 'all',
    sort: 'newest',
  },
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().courses;
      const mergedParams = {
        ...state.filters,
        ...params,
      };
      const res = await API.get('/courses', { params: mergedParams });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchFeaturedCourses = createAsyncThunk(
  'courses/fetchFeaturedCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/courses/featured');
      return res.data.courses;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/courses/${id}`);
      return res.data.course;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'courses/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/courses/categories');
      return res.data.categories;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchInstructorCourses = createAsyncThunk(
  'courses/fetchInstructorCourses',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/courses/instructor/my-courses');
      return res.data.courses;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const res = await API.post('/courses', courseData);
      return res.data.course;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const togglePublishCourse = createAsyncThunk(
  'courses/togglePublishCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/courses/${courseId}/publish`);
      return { courseId, isPublished: res.data.isPublished };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await API.delete(`/courses/${courseId}`);
      return courseId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        keyword: '',
        category: 'All',
        level: 'All',
        price: 'all',
        sort: 'newest',
      };
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Featured
      .addCase(fetchFeaturedCourses.fulfilled, (state, action) => {
        state.featuredCourses = action.payload;
      })
      // Course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Instructor Courses
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.instructorCourses = action.payload;
      })
      // Create Course
      .addCase(createCourse.fulfilled, (state, action) => {
        state.instructorCourses.unshift(action.payload);
      })
      // Toggle Publish
      .addCase(togglePublishCourse.fulfilled, (state, action) => {
        const found = state.instructorCourses.find(
          (c) => c._id === action.payload.courseId
        );
        if (found) found.isPublished = action.payload.isPublished;
      })
      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.instructorCourses = state.instructorCourses.filter(
          (c) => c._id !== action.payload
        );
      });
  },
});

export const { setFilter, resetFilters, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
