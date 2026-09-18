import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { fetchNotifications, addNotification } from './store/slices/notificationSlice';
import { connectSocket } from './services/socket';
import { toast } from 'sonner';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Public Components
import Home from './pages/public/Home';
import CourseCatalog from './pages/public/CourseCatalog';
import CourseDetail from './pages/public/CourseDetail';
import CertificateVerify from './pages/public/CertificateVerify';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import NotFound from './pages/Errors/NotFound';

// Guard & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Student Components
import StudentDashboard from './pages/student/Dashboard';
import StudentMycourses from './pages/student/Mycourses';
import CoursePlayer from './pages/student/CoursePlayer';
import QuizTaker from './pages/student/QuizTaker';
import CertificateViewer from './pages/student/CertificateViewer';
import Chat from './pages/student/Chat';
import Profile from './pages/student/Profile';
import Progress from './pages/student/Progress';
import Assignments from './pages/student/Assignments';
import Resources from './pages/student/Resources';
import Schedule from './pages/student/Schedule';
import Setting from './pages/student/Setting';

// Instructor Components
import InstructorDashboard from './pages/Instructor/Dashboard';
import CourseManagement from './pages/Instructor/CourseManagement';
import CourseEditor from './pages/Instructor/CourseEditor';
import InstructorAnalytics from './pages/Instructor/InstructorAnalytics';

// Admin Components
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminInstructors from './pages/admin/AdminInstructors';
import AdminStudents from './pages/admin/AdminStudents';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // When the app loads or refreshes, verify the session via backend GET /api/auth/me
  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  // Connect socket notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && (user?.id || user?._id)) {
      const currentUserId = user.id || user._id;
      const socket = connectSocket(currentUserId);

      const handleNewNotification = (data) => {
        dispatch(addNotification(data));
        toast.info(data.title || 'New notification', {
          description: data.message,
        });
      };

      socket.on('new_notification', handleNewNotification);
      dispatch(fetchNotifications());

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    }
  }, [dispatch, isAuthenticated, user]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/verify/:code" element={<CertificateVerify />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <Register />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <ForgotPassword />
          }
        />
        <Route
          path="/reset-password"
          element={
            isAuthenticated ? <Navigate to={getDashboardPath()} replace /> : <ResetPassword />
          }
        />

        {/* Direct Universal Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Standalone Immersive Learning Experiences */}
        <Route
          path="/student/course/:courseId/learn"
          element={
            <ProtectedRoute>
              <CoursePlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/course/:courseId/quiz/:quizId"
          element={
            <ProtectedRoute>
              <QuizTaker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/certificates/:id"
          element={
            <ProtectedRoute>
              <CertificateViewer />
            </ProtectedRoute>
          }
        />

        {/* Student Portal (With Sidebar Layout) */}
        <Route
          path="/student"
          element={
            <RoleBasedRoute allowedRoles={['student']}>
              <StudentLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="my-courses" element={<StudentMycourses />} />
          <Route path="progress" element={<Progress />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="resources" element={<Resources />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="setting" element={<Setting />} />
        </Route>

        {/* Instructor Portal */}
        <Route
          path="/instructor"
          element={
            <RoleBasedRoute allowedRoles={['instructor', 'admin']}>
              <InstructorLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/:id/editor" element={<CourseEditor />} />
          <Route path="analytics" element={<InstructorAnalytics />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Super Admin Portal */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;