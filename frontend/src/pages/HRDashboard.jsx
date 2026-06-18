import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Video, CheckCircle2, Clock, ArrowRight,
  Plus, ExternalLink, Zap, Building2, ChevronRight
} from 'lucide-react';
import { analyticsAPI, interviewsAPI } from '../services/api';
import { StatCard } from '../components/ui/Card';
import { StatusBadge, InterviewTypeBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDateTime, getRelativeTime, PLATFORM_CONFIG } from '../lib/utils';
import useAuthStore from '../store/authStore';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HRDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      interviewsAPI.getUpcoming(),
    ]).then(([statsRes, upcomingRes]) => {
      setStats(statsRes.data.data);
      setUpcoming(upcomingRes.data.data.interviews);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-100 rounded-xl w-72 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </motion.div>

      <motion.button
        type="button"
        variants={fadeUp}
        onClick={() => navigate('/settings?tab=workspace')}
        className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-white border border-violet-200/80 shadow-sm hover:shadow-md hover:border-violet-300/80 transition-all text-left group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-violet-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">Company Space code</p>
            <p className="text-xs text-slate-500 mt-0.5">Invite HR teammates to register with your workspace code, copy the invite link, and more.</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
      </motion.button>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="My Upcoming" value={overview.upcoming ?? 0} icon={Clock} color="brand" />
        <StatCard label="Scheduled This Month" value={overview.thisMonth ?? 0} icon={Calendar} color="emerald" />
        <StatCard label="Completion Rate" value={`${overview.completionRate ?? 0}%`} icon={CheckCircle2} color="slate" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/schedule')}
          className="w-full p-6 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-left">
              <p className="text-xl font-black">Schedule Interview</p>
              <p className="text-brand-100 text-sm mt-0.5">Create a new interview in seconds</p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 opacity-70 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-base font-semibold text-slate-900">Next 5 Upcoming Interviews</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/pipeline')} className="text-brand-600">
            View Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="p-6">
          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No upcoming interviews</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/schedule')}>
                Schedule Your First Interview
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((interview, i) => (
                <motion.div key={interview._id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/interviews/${interview._id}`)}
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0 border border-brand-100">
                    <p className="text-xs font-bold text-brand-700 leading-none">
                      {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-lg font-black text-brand-700 leading-none mt-0.5">
                      {new Date(interview.scheduledAt).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900 truncate">{interview.role}</p>
                      <InterviewTypeBadge type={interview.interviewType} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateTime(interview.scheduledAt)} · {interview.duration}min
                      {interview.candidateEmail && ` · ${interview.candidateName || interview.candidateEmail}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={interview.status} />
                    <span className="text-xs text-slate-400 hidden sm:block">{getRelativeTime(interview.scheduledAt)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); interview.meetingLink ? window.open(interview.meetingLink, '_blank') : navigate(`/interviews/${interview._id}`); }}
                      className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                      title={interview.meetingLink ? 'Join Meeting' : 'View Details'}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
