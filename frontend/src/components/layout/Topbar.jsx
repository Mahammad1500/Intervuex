import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Plus, LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';
import { notificationsAPI } from '../../services/api';
import { cn, getRelativeTime } from '../../lib/utils';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/interviews': 'Interviews',
  '/pipeline': 'Hiring Pipeline',
  '/schedule': 'Schedule Interview',
  '/analytics': 'Analytics',
  '/workspaces': 'Company Workspaces',
  '/users': 'Team Management',
  '/audit': 'Audit Log',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuClick, sidebarOpen }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const title = PAGE_TITLES[location.pathname] || 'Intervuex';

  useEffect(() => {
    notificationsAPI.getAll({ limit: 8 }).then(({ data }) => {
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    }).catch(() => {});
  }, [location.pathname]);

  const handleLogout = async () => {
    setShowProfile(false);
    setShowNotifs(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="flex items-center h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 gap-4 z-10">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onMenuClick}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      {user?.role === 'hr' && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/schedule')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 gradient-brand text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/30 hover:shadow-lg hover:shadow-brand-500/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </motion.button>
      )}

      <ThemeToggle size="sm" className="hidden sm:inline-flex" />

      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-600 font-medium hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div key={n._id} className={cn('px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors', !n.isRead && 'bg-brand-50/40')}>
                    <div className="flex gap-3">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{getRelativeTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.firstName}</p>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </motion.button>

        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
