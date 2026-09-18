import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';

export const pagesConfig = {
  Pages: {
    dashboard: AdminDashboard,
    courses: AdminCourses,
    users: AdminUsers,
    reports: AdminReports,
    settings: AdminSettings,
  },
  Layout: null, // Set to your layout component if needed
  mainPage: 'dashboard', // Default page to show at '/'
};
