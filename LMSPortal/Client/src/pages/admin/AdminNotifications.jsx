import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
  Bell,
  Send,
  Users,
  GraduationCap,
  UserCheck,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Sparkles,
  History,
  Link as LinkIcon,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminNotifications = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetRole: 'all',
    link: '',
  });

  const fetchBroadcastHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await API.get('/notifications/broadcasts');
      setBroadcasts(res.data.broadcasts || []);
    } catch (err) {
      console.error('Failed to fetch broadcasts history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchBroadcastHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please enter both title and message for the broadcast.');
      return;
    }

    try {
      setSending(true);
      const res = await API.post('/notifications/broadcast', formData);
      toast.success(res.data.message || 'Notification broadcast sent successfully!');
      setFormData({
        title: '',
        message: '',
        type: 'announcement',
        targetRole: 'all',
        link: '',
      });
      fetchBroadcastHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch broadcast');
    } finally {
      setSending(false);
    }
  };

  const getTargetLabel = (role) => {
    if (role === 'student') return 'Students Only';
    if (role === 'instructor') return 'Instructors Only';
    return 'All Registered Users';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-rose-600" />
          Broadcast Notifications & Announcements
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Dispatch platform-wide alerts, system maintenance notifications, or curriculum announcements directly to users' inboxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Composer Form (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-rose-600" />
              Compose New Broadcast Announcement
            </h2>
            <p className="text-xs text-slate-500">
              Notification will be delivered instantaneously to all matching active accounts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Target Audience Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Target Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'all', label: 'All Platform Users', icon: Users },
                  { value: 'student', label: 'Students Only', icon: GraduationCap },
                  { value: 'instructor', label: 'Instructors Only', icon: UserCheck },
                ].map((aud) => {
                  const Icon = aud.icon;
                  const isSelected = formData.targetRole === aud.value;
                  return (
                    <button
                      key={aud.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, targetRole: aud.value })}
                      className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all text-left ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{aud.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Notification Category / Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { value: 'announcement', label: 'Announcement', color: 'text-blue-600' },
                  { value: 'system', label: 'System Notice', color: 'text-amber-600' },
                  { value: 'reminder', label: 'Reminder', color: 'text-purple-600' },
                  { value: 'course', label: 'Curriculum Update', color: 'text-emerald-600' },
                ].map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.value })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                      formData.type === t.value
                        ? 'border-rose-500 bg-rose-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Notification Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Scheduled Maintenance This Sunday"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Message Content *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Write the detailed broadcast message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Link (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Direct Link / URL (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. /courses or https://status.lmsportal.com"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 transition-all text-slate-900 dark:text-white"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Broadcast Now
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview & Info (Right 1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recipient Preview
            </h3>
            <p className="text-xs text-slate-500">
              This is how recipients will see the notification in their dropdown banner:
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {formData.type}
                </span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {formData.title || 'Notification Headline'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {formData.message || 'Notification body text will appear here once typed...'}
              </p>
              {formData.link && (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium block truncate">
                  Target link: {formData.link}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> High Broadcast Reach
              </span>
              <p className="text-[11px] leading-relaxed">
                Broadcasting to <strong>{getTargetLabel(formData.targetRole)}</strong> will store records in all target accounts and trigger active socket popups for connected users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-rose-600" />
              Past Broadcast Announcements
            </h3>
            <p className="text-xs text-slate-500">Log of previously dispatched system notifications</p>
          </div>
          <button
            onClick={fetchBroadcastHistory}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Refresh Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Announcement Title</th>
                <th className="py-3.5 px-4 font-semibold">Message Preview</th>
                <th className="py-3.5 px-4 font-semibold">Type</th>
                <th className="py-3.5 px-4 font-semibold">Recipients Reached</th>
                <th className="py-3.5 px-4 font-semibold">Dispatched At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loadingHistory ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Loading broadcast history...
                  </td>
                </tr>
              ) : broadcasts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No broadcast announcements sent yet.
                  </td>
                </tr>
              ) : (
                broadcasts.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {b.title}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 max-w-sm truncate">
                      {b.message}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {b.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {b.recipientsCount} users
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(b.sentAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
