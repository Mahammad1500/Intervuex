import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Clock, ExternalLink, User, Search, Filter } from 'lucide-react';
import { interviewsAPI } from '../services/api';
import { InterviewTypeBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatDate, PLATFORM_CONFIG } from '../lib/utils';
import { toast } from '../components/ui/Toaster';

const COLUMNS = [
  { id: 'scheduled', label: 'Scheduled', color: 'border-blue-400', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  { id: 'confirmed', label: 'Confirmed', color: 'border-emerald-400', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
  { id: 'completed', label: 'Completed', color: 'border-slate-400', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  { id: 'cancelled', label: 'Cancelled', color: 'border-red-400', bg: 'bg-red-50', dot: 'bg-red-400' },
];

const INTERVIEW_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'screening', label: 'Screening' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'system-design', label: 'System Design' },
  { value: 'hr', label: 'HR Round' },
  { value: 'final', label: 'Final Round' },
];

export default function Pipeline() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    interviewsAPI.getAll({ limit: 100 })
      .then(({ data }) => setInterviews(data.data.interviews))
      .catch(() => toast.error('Failed to load pipeline'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return interviews.filter(i => {
      const matchesSearch = !searchQuery ||
        (i.candidateName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.candidateEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !typeFilter || i.interviewType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [interviews, searchQuery, typeFilter]);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filtered.filter(i => i.status === col.id);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Hiring Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} interviews across all stages</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/schedule')}>Schedule Interview</Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Search by candidate name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {INTERVIEW_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => (
            <div key={col.id} className="space-y-3">
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${col.bg} border-l-4 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-bold text-slate-700">{col.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">
                  {grouped[col.id]?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {grouped[col.id]?.length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">No interviews</p>
                  </div>
                ) : grouped[col.id]?.map((interview, i) => {
                  const platform = PLATFORM_CONFIG[interview.meetingPlatform];
                  const candidateInitial = (interview.candidateName || interview.candidateEmail || 'C')[0].toUpperCase();
                  return (
                    <motion.div key={interview._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:shadow-card hover:border-brand-200 transition-all"
                      onClick={() => navigate(`/interviews/${interview._id}`)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 leading-tight flex-1">{interview.role}</p>
                        <InterviewTypeBadge type={interview.interviewType} />
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-brand-700">{candidateInitial}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {interview.candidateName || interview.candidateEmail}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-400">{formatDate(interview.scheduledAt)}</p>
                      </div>

                      {interview.interviewerName && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <p className="text-xs text-slate-400 truncate">{interview.interviewerName}</p>
                        </div>
                      )}

                      {interview.meetingLink && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-400">{platform?.icon} {platform?.label}</span>
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-brand-600 hover:text-brand-700">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
