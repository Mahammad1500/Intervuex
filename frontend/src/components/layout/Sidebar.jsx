import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Settings,
  Video, GitBranch, ChevronRight, Building2, Shield
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['admin', 'hr'] },
  { label: 'Interviews', icon: Video, href: '/interviews', roles: ['admin', 'hr'] },
  { label: 'Pipeline', icon: GitBranch, href: '/pipeline', roles: ['hr'] },
  { label: 'Schedule', icon: Calendar, href: '/schedule', roles: ['admin', 'hr'] },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', roles: ['admin', 'hr'] },
  { label: 'Workspaces', icon: Building2, href: '/workspaces', roles: ['admin'] },
  { label: 'Team', icon: Users, href: '/users', roles: ['admin'] },
  { label: 'Audit log', icon: Shield, href: '/audit', roles: ['admin'] },
  { label: 'Settings', icon: Settings, href: '/settings', roles: ['admin', 'hr'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user?.role));

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: open ? 240 : 72, x: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-30 flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <img src="/assets/IntervuexLogo.png" alt="Intervuex" className="w-9 h-9 rounded-xl object-contain flex-shrink-0" />
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                className="min-w-0"
              >
                <span className="text-lg font-bold gradient-text tracking-tight">Intervuex</span>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Interview Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-hide">
          {filtered.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <NavLink key={item.href} to={item.href}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group cursor-pointer',
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-sm font-medium truncate flex-1"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {open && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    )}
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/settings?tab=profile')}
            className={cn('w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left', !open && 'justify-center')}
            title="Open profile & settings"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-400 capitalize truncate">{user?.role} · Account</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
