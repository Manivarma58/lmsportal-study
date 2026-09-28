import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';
import { fetchNotifications, addNotification } from './store/slices/notificationSlice';
import { connectSocket } from './services/socket';
import { toast } from 'sonner';

// Guard & Layouts (Synchronous core infrastructure)
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import StudentLayout from './layouts/StudentLayout';
import InstructorLayout from './layouts/InstructorLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Components (Lazy-loaded)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Public Components (Lazy-loaded)
const Home = lazy(() => import('./pages/public/Home'));
const CourseCatalog = lazy(() => import('./pages/public/CourseCatalog'));
const CourseDetail = lazy(() => import('./pages/public/CourseDetail'));
const CertificateVerify = lazy(() => import('./pages/public/CertificateVerify'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const NotFound = lazy(() => import('./pages/Errors/NotFound'));

// Student Components (Lazy-loaded)
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentMycourses = lazy(() => import('./pages/student/Mycourses'));
const CoursePlayer = lazy(() => import('./pages/student/CoursePlayer'));
const QuizTaker = lazy(() => import('./pages/student/QuizTaker'));
const CertificateViewer = lazy(() => import('./pages/student/CertificateViewer'));
const CertificateGallery = lazy(() => import('./pages/student/CertificateGallery'));
const Chat = lazy(() => import('./pages/student/Chat'));
const Profile = lazy(() => import('./pages/student/Profile'));
const Progress = lazy(() => import('./pages/student/Progress'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Resources = lazy(() => import('./pages/student/Resources'));
const Schedule = lazy(() => import('./pages/student/Schedule'));
const Setting = lazy(() => import('./pages/student/Setting'));
const NotificationPage = lazy(() => import('./pages/shared/NotificationPage'));
const CodingLabList = lazy(() => import('./pages/student/CodingLabList'));
const CodingLabDetail = lazy(() => import('./pages/student/CodingLabDetail'));
const ProjectList = lazy(() => import('./pages/student/ProjectList'));
const ProjectWorkspace = lazy(() => import('./pages/student/ProjectWorkspace'));
const SkillGapAnalyzer = lazy(() => import('./pages/student/SkillGapAnalyzer'));
const AIMentor = lazy(() => import('./pages/student/AIMentor'));
const JobSimulationList = lazy(() => import('./pages/student/JobSimulationList'));
const JobSimulationWorkspace = lazy(() => import('./pages/student/JobSimulationWorkspace'));
const AdaptiveLearning = lazy(() => import('./pages/student/AdaptiveLearning'));
const LearnerPortfolio = lazy(() => import('./pages/student/LearnerPortfolio'));
const PublicPortfolio = lazy(() => import('./pages/public/PublicPortfolio'));

// Instructor Components (Lazy-loaded)
const InstructorDashboard = lazy(() => import('./pages/Instructor/Dashboard'));
const CourseManagement = lazy(() => import('./pages/Instructor/CourseManagement'));
const CourseEditor = lazy(() => import('./pages/Instructor/CourseEditor'));
const InstructorAnalytics = lazy(() => import('./pages/Instructor/InstructorAnalytics'));
const AssignmentEvaluation = lazy(() => import('./pages/Instructor/AssignmentEvaluation'));

// Admin Components (Lazy-loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminInstructors = lazy(() => import('./pages/admin/AdminInstructors'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));

// Lightweight, seamless loading indicator for instantaneous route transitions
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] w-full flex flex-col items-center justify-center bg-transparent text-slate-600">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping"></div>
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
    </div>
    <span className="mt-3 text-xs font-semibold text-slate-500 font-sans tracking-wide">
      Loading workspace module...
    </span>
  </div>
);

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
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
        <Route
          path="/courses"
          element={
            isAuthenticated && user?.role === 'student' ? (
              <Navigate to="/student/courses" replace />
            ) : (
              <CourseCatalog />
            )
          }
        />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/verify" element={<CertificateVerify />} />
        <Route path="/verify/:code" element={<CertificateVerify />} />
        <Route path="/certificates/verify/:code" element={<CertificateVerify />} />
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

        {/* Public Verified Recruiter Skill Portfolio */}
        <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
        <Route path="/portfolio/public/:slug" element={<PublicPortfolio />} />

        {/* Direct Universal Profile & Notification Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? (
                <Navigate to="/admin/notifications" replace />
              ) : user?.role === 'instructor' ? (
                <Navigate to="/instructor/notifications" replace />
              ) : (
                <Navigate to="/student/notifications" replace />
              )}
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
          path="/student/quiz/:quizId"
          element={
            <ProtectedRoute>
              <QuizTaker />
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
          <Route path="courses" element={<CourseCatalog embedded={true} />} />
          <Route path="explore" element={<CourseCatalog embedded={true} />} />
          <Route path="course-discovery" element={<CourseCatalog embedded={true} />} />
          <Route path="progress" element={<Progress />} />
          <Route path="certificates" element={<CertificateGallery />} />
          <Route path="certificates/:id" element={<CertificateViewer />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="skill-gap" element={<SkillGapAnalyzer />} />
          <Route path="skill-gap-analyzer" element={<SkillGapAnalyzer />} />
          <Route path="mentor" element={<AIMentor />} />
          <Route path="ai-mentor" element={<AIMentor />} />
          <Route path="adaptive" element={<AdaptiveLearning />} />
          <Route path="adaptive-learning" element={<AdaptiveLearning />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectWorkspace />} />
          <Route path="simulations" element={<JobSimulationList />} />
          <Route path="simulations/:id" element={<JobSimulationWorkspace />} />
          <Route path="job-simulations" element={<JobSimulationList />} />
          <Route path="job-simulations/:id" element={<JobSimulationWorkspace />} />
          <Route path="portfolio" element={<LearnerPortfolio />} />
          <Route path="skill-portfolio" element={<LearnerPortfolio />} />
          <Route path="quizzes" element={<QuizTaker embedded={true} />} />
          <Route path="challenges" element={<CodingLabList />} />
          <Route path="coding-lab" element={<CodingLabList />} />
          <Route path="challenge/:id" element={<CodingLabDetail />} />
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
          <Route path="create-course" element={<CourseEditor />} />
          <Route path="courses/new" element={<CourseEditor />} />
          <Route path="courses/:id/editor" element={<CourseEditor />} />
          <Route path="assignments" element={<AssignmentEvaluation />} />
          <Route path="evaluations" element={<AssignmentEvaluation />} />
          <Route path="analytics" element={<InstructorAnalytics />} />
          <Route path="chat" element={<Chat />} />
          <Route path="notifications" element={<NotificationPage />} />
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
    </Suspense>
  </div>
);
}

export default App;