import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
} from '../store/slices/notificationSlice';
import {
  Bell,
  CheckCheck,
  BookOpen,
  Award,
  MessageSquare,
  Info,
  X,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  GraduationCap,
  Megaphone,
  Trash2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      dispatch(fetchNotifications(30));
    }
  }, [dispatch, isAuthenticated, isOpen]);

  if (!isOpen) return null;

  const handleNotificationClick = (item) => {
    const isUnread = !item.read && !item.isRead;
    if (isUnread) {
      dispatch(markAsRead(item._id));
    }
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteNotificationById(id));
  };

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const getNotificationVisual = (type) => {
    switch (type) {
      case 'course_enrollment':
      case 'enrollment':
        return {
          icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
          bg: 'bg-indigo-500/15 border-indigo-500/30',
        };
      case 'new_course':
        return {
          icon: <Sparkles className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-500/15 border-amber-500/30',
        };
      case 'new_lesson':
      case 'course_update':
        return {
          icon: <PlayCircle className="w-4 h-4 text-sky-400" />,
          bg: 'bg-sky-500/15 border-sky-500/30',
        };
      case 'quiz_result':
      case 'quiz_graded':
        return {
          icon: <Award className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30',
        };
      case 'course_completion':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          bg: 'bg-emerald-500/15 border-emerald-500/30',
        };
      case 'certificate_generation':
      case 'certificate':
        return {
          icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
          bg: 'bg-purple-500/15 border-purple-500/30',
        };
      case 'instructor_announcement':
      case 'announcement':
        return {
          icon: <Megaphone className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-500/15 border-rose-500/30',
        };
      case 'chat_message':
        return {
          icon: <MessageSquare className="w-4 h-4 text-teal-400" />,
          bg: 'bg-teal-500/15 border-teal-500/30',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-400" />,
          bg: 'bg-blue-500/15 border-blue-500/30',
        };
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => dispatch(markAllAsRead())}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60">
        {notifications.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-700" />
            <p className="text-sm font-semibold text-slate-400">All caught up!</p>
            <p className="text-xs text-slate-600 mt-0.5">No notifications to display.</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((item) => {
            const visual = getNotificationVisual(item.type);
            const isUnread = !item.read && !item.isRead;

            return (
              <div
                key={item._id}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 flex gap-3 cursor-pointer transition-colors group relative hover:bg-slate-800/60 ${
                  isUnread ? 'bg-indigo-950/20' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${visual.bg}`}
                >
                  {visual.icon}
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-xs font-bold text-white truncate">{item.title}</p>
                    {isUnread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    •{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Quick actions on hover */}
                <div className="absolute right-2 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUnread && (
                    <button
                      onClick={(e) => handleMarkRead(e, item._id)}
                      className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-emerald-400"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, item._id)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link to Notification Center */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
        <Link
          to={
            user?.role === 'admin'
              ? '/admin/notifications'
              : user?.role === 'instructor'
              ? '/instructor/notifications'
              : '/student/notifications'
          }
          onClick={onClose}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Open Notification Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default NotificationDrawer;
