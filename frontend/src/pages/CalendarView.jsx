import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, ExternalLink } from 'lucide-react';
import { interviewsAPI } from '../services/api';
import { InterviewTypeBadge, StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatTime, PLATFORM_CONFIG } from '../lib/utils';
import { toast } from '../components/ui/Toaster';
import useAuthStore from '../store/authStore';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [interviews, setInterviews] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
    interviewsAPI.getAll({ from, to, limit: 200 })
      .then(({ data }) => setInterviews(data.data.interviews))
      .catch(() => toast.error('Failed to load interviews'))
      .finally(() => setLoading(false));
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const getInterviewsForDay = (day) => {
    return interviews.filter(i => {
      const d = new Date(i.scheduledAt);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const selectedDayInterviews = selectedDate ? getInterviewsForDay(selectedDate) : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const statusDot = {
    scheduled: 'bg-blue-500',
    confirmed: 'bg-emerald-500',
    completed: 'bg-slate-400',
    cancelled: 'bg-red-400',
    rescheduled: 'bg-amber-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your interview schedule at a glance</p>
        </div>
        {['admin', 'hr'].includes(user?.role) && (
          <Button icon={Plus} onClick={() => navigate('/schedule')}>Schedule</Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.92 }} onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }}
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors">
                Today
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayInterviews = getInterviewsForDay(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                const isSelected = selectedDate === day;

                return (
                  <motion.div key={day} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' :
                      isToday ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-300' :
                      'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`text-sm font-bold leading-none ${isSelected ? 'text-white' : ''}`}>{day}</span>
                    {dayInterviews.length > 0 && (
                      <div className="flex gap-0.5 mt-1.5 flex-wrap justify-center">
                        {dayInterviews.slice(0, 3).map((interview, idx) => (
                          <span key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : (statusDot[interview.status] || 'bg-brand-400')}`} />
                        ))}
                        {dayInterviews.length > 3 && (
                          <span className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-brand-500'}`}>+{dayInterviews.length - 3}</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="px-4 pb-4 flex items-center gap-4 flex-wrap">
            {Object.entries(statusDot).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-slate-500 capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {selectedDate ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {MONTHS[month]} {selectedDate}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  {selectedDayInterviews.length} interview{selectedDayInterviews.length !== 1 ? 's' : ''}
                </p>
              </div>
              {selectedDayInterviews.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400 text-sm">No interviews scheduled</p>
                  {['admin', 'hr'].includes(user?.role) && (
                    <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigate('/schedule')}>
                      Schedule One
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {selectedDayInterviews.map((interview) => {
                    const platform = PLATFORM_CONFIG[interview.meetingPlatform];
                    return (
                      <div key={interview._id}
                        className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer"
                        onClick={() => navigate(`/interviews/${interview._id}`)}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-bold text-slate-900 flex-1 leading-tight">{interview.role}</p>
                          <StatusBadge status={interview.status} />
                        </div>
                        <InterviewTypeBadge type={interview.interviewType} />
                        <div className="flex items-center gap-1.5 mt-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-500">
                            {formatTime(interview.scheduledAt)} · {interview.duration}min
                          </p>
                        </div>
                        {interview.candidate && (
                          <p className="text-xs text-slate-400 mt-1">
                            {interview.candidate.firstName} {interview.candidate.lastName}
                          </p>
                        )}
                        {interview.meetingLink && (
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="mt-2 flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:underline w-fit">
                            <ExternalLink className="w-3 h-3" />
                            {platform?.label}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 text-center">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-brand-500" />
              </div>
              <p className="text-sm font-medium text-slate-600">Select a day to view interviews</p>
              <p className="text-xs text-slate-400 mt-1">Click any date with dots to see details</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">This Month Summary</h3>
            <div className="space-y-2">
              {[
                { label: 'Total', value: interviews.length, color: 'text-slate-800' },
                { label: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, color: 'text-blue-600' },
                { label: 'Confirmed', value: interviews.filter(i => i.status === 'confirmed').length, color: 'text-emerald-600' },
                { label: 'Completed', value: interviews.filter(i => i.status === 'completed').length, color: 'text-slate-500' },
                { label: 'Cancelled', value: interviews.filter(i => i.status === 'cancelled').length, color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
