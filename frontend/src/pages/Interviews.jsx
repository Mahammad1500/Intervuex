import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, Plus, Video, Calendar, ChevronDown,
  ExternalLink, MoreHorizontal, Eye, XCircle, RefreshCw
} from 'lucide-react';
import { interviewsAPI } from '../services/api';
import { StatusBadge, InterviewTypeBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDateTime, getRelativeTime, PLATFORM_CONFIG } from '../lib/utils';
import useAuthStore from '../store/authStore';
import { toast } from '../components/ui/Toaster';
import Modal from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';

const STATUS_FILTERS = ['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
const TYPE_FILTERS = ['all', 'technical', 'behavioral', 'system-design', 'hr', 'final', 'screening'];

export default function Interviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: 'all', interviewType: 'all', search: '', page: 1 });
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 15 };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.interviewType !== 'all') params.interviewType = filters.interviewType;
      if (filters.search) params.role = filters.search;
      const { data } = await interviewsAPI.getAll(params);
      setInterviews(data.data.interviews);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await interviewsAPI.cancel(cancelModal._id, cancelReason);
      toast.success('Interview cancelled', 'All participants have been notified.');
      setCancelModal(null);
      setCancelReason('');
      fetchInterviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Interviews</h1>
          <p className="text-sm text-slate-500 mt-0.5 max-w-xl">
            {user?.role === 'hr'
              ? 'Rounds for your company (candidate, interviewer, role, and time) — as scheduled by your HR team.'
              : 'Cross-workspace view: every scheduled round across companies.'}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total ?? 0} total interviews</p>
        </div>
        {['admin', 'hr'].includes(user?.role) && (
          <Button icon={Plus} onClick={() => navigate('/schedule')}>Schedule</Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all"
              placeholder="Search by role..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          >
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
            value={filters.interviewType}
            onChange={e => setFilters(f => ({ ...f, interviewType: e.target.value, page: 1 }))}
          >
            {TYPE_FILTERS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
          <Button variant="ghost" size="md" icon={RefreshCw} onClick={fetchInterviews} className="flex-shrink-0" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No interviews found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          {['admin', 'hr'].includes(user?.role) && (
            <Button className="mt-5" onClick={() => navigate('/schedule')}>Schedule Interview</Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Interview / Role', 'Participants', 'Date & Time', 'Type', 'Status', 'Platform', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {interviews.map((interview, i) => {
                  const platform = PLATFORM_CONFIG[interview.meetingPlatform] || PLATFORM_CONFIG['google-meet'];
                  return (
                    <motion.tr key={interview._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/interviews/${interview._id}`)}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">{interview.role}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{interview.duration}min</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {interview.candidate && (
                            <p className="text-xs text-slate-600">
                              <span className="text-slate-400">Candidate: </span>
                              {interview.candidate.firstName} {interview.candidate.lastName}
                            </p>
                          )}
                          {interview.interviewer && (
                            <p className="text-xs text-slate-600">
                              <span className="text-slate-400">Interviewer: </span>
                              {interview.interviewer.firstName} {interview.interviewer.lastName}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700 font-medium whitespace-nowrap">{formatDateTime(interview.scheduledAt)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{getRelativeTime(interview.scheduledAt)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <InterviewTypeBadge type={interview.interviewType} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={interview.status} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500">{platform.icon} {platform.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigate(`/interviews/${interview._id}`); }}>
                            <Eye className="w-4 h-4" />
                          </button>
                          {interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 rounded-lg hover:bg-brand-50 text-slate-400 hover:text-brand-600 transition-colors">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {['admin', 'hr'].includes(user?.role) && !['cancelled', 'completed'].includes(interview.status) && (
                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setCancelModal(interview); }}>
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.pages} · {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={!pagination.hasPrev}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={!pagination.hasNext}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Interview"
        description={`Cancel the ${cancelModal?.interviewType} interview for ${cancelModal?.role}?`}>
        <div className="space-y-4">
          <Textarea label="Reason for cancellation (optional)"
            placeholder="Please provide a reason to notify participants..."
            rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCancelModal(null)}>Keep Interview</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel}>Cancel Interview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
