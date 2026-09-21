import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { updateProfile } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { toast } from 'sonner';

export default function Setting() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  // Settings state initialized with real user data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    headline: user?.headline || 'Engineering Scholar',
    bio: user?.bio || '',
    avatar: user?.avatar || user?.profileImage || '',
    timezone: 'UTC+05:30 (IST)',
    language: 'en_US',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    courseAnnouncements: true,
    assignmentDeadlines: true,
    quizScorecards: true,
    weeklyDigest: false,
    soundAlerts: true,
  });

  // Editor/Sandbox preferences
  const [sandboxPrefs, setSandboxPrefs] = useState({
    theme: 'light',
    fontSize: '14',
    tabSize: '2',
    lineNumbers: true,
    autoSave: true,
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        headline: user.headline || prev.headline,
        bio: user.bio || prev.bio,
        avatar: user.avatar || user.profileImage || prev.avatar,
      }));
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await dispatch(
        updateProfile({
          name: profileData.name,
          headline: profileData.headline,
          bio: profileData.bio,
          avatar: profileData.avatar,
        })
      ).unwrap();
      toast.success('Account profile settings saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update account settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
    }
  };

  return (
    <div className="flex flex-col w-full text-slate-800 antialiased pb-16 px-6 sm:px-8 lg:px-10 py-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-2 pb-6 border-b border-slate-200/90">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <Link to="/student/dashboard" className="hover:text-blue-600 transition-colors">
            Student Portal
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Settings</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student System &amp; Account Settings
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage your personal scholar credentials, notifications, and interactive sandbox preferences.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-200/70 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            ACCOUNT SYNCED
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 py-4 mb-6 overflow-x-auto">
        {[
          { id: 'account', label: 'Account & Identity', icon: 'person' },
          { id: 'security', label: 'Security & Password', icon: 'lock' },
          { id: 'notifications', label: 'Notification Alerts', icon: 'notifications' },
          { id: 'sandbox', label: 'Sandbox Environment', icon: 'code' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Account & Identity */}
      {activeTab === 'account' && (
        <form onSubmit={handleProfileSave} className="flex flex-col gap-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-5">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Scholar Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Headline</label>
              <input
                type="text"
                value={profileData.headline}
                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Statement of Intent</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={profileData.avatar}
                onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 max-w-3xl">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Update System Password
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                Update Password
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4 max-w-3xl">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Notification &amp; Alert Telemetry
          </h3>

          {[
            { key: 'courseAnnouncements', label: 'Faculty & Course Announcements', desc: 'Alerts when instructors post updates or new syllabus units.' },
            { key: 'assignmentDeadlines', label: 'Assignment & Laboratory Deadlines', desc: 'Reminders 24 hours and 2 hours prior to assignment deadlines.' },
            { key: 'quizScorecards', label: 'Automated Evaluation Scorecards', desc: 'Instant dispatch when quizzes and code tests finish grading.' },
            { key: 'weeklyDigest', label: 'Weekly Academic Progress Digest', desc: 'Consolidated summary of weekly hours, velocity, and certificates.' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.label}</h4>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notificationPrefs[item.key]}
                onChange={(e) => {
                  setNotificationPrefs({ ...notificationPrefs, [item.key]: e.target.checked });
                  toast.success('Notification preferences updated.');
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Sandbox Environment */}
      {activeTab === 'sandbox' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col gap-4 max-w-3xl">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Interactive Code Sandbox Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Editor Theme</label>
              <select
                value={sandboxPrefs.theme}
                onChange={(e) => setSandboxPrefs({ ...sandboxPrefs, theme: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="light">Technical Blueprint Light</option>
                <option value="dark">Cyber Terminal Dark</option>
                <option value="high_contrast">High Contrast Monochrome</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Font Size (px)</label>
              <select
                value={sandboxPrefs.fontSize}
                onChange={(e) => setSandboxPrefs({ ...sandboxPrefs, fontSize: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="12">12px - Compact</option>
                <option value="14">14px - Recommended</option>
                <option value="16">16px - Large</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">DEFAULT RUNTIME: NODE 20 + PYTHON 3.11</span>
            <button
              onClick={() => toast.success('Sandbox preferences saved!')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}