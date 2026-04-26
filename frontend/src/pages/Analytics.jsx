import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, CheckCircle2, XCircle, Star } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import { StatCard } from '../components/ui/Card';
import { toast } from '../components/ui/Toaster';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const RECOMMENDATION_LABELS = {
  'strong-hire': 'Strong Hire',
  'hire': 'Hire',
  'neutral': 'Neutral',
  'no-hire': 'No Hire',
  'strong-no-hire': 'Strong No Hire',
};

const RECOMMENDATION_COLORS = {
  'strong-hire': '#10b981',
  'hire': '#6366f1',
  'neutral': '#94a3b8',
  'no-hire': '#f59e0b',
  'strong-no-hire': '#ef4444',
};

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getTrends({ period: `${period}d`, groupBy: 'day' }),
      analyticsAPI.getFunnel(),
      analyticsAPI.getFeedbackStats(),
      analyticsAPI.getInterviewerPerformance(),
    ]).then(([d, t, f, fb, p]) => {
      setDashboard(d.data.data);
      setTrends(t.data.data);
      setFunnel(f.data.data);
      setFeedbackStats(fb.data.data);
      setPerformance(p.data.data);
    }).catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Hiring insights and interview performance</p>
        </div>
        <select
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Interviews" value={overview.total ?? 0} icon={BarChart3} color="brand" />
        <StatCard label="Completion Rate" value={`${overview.completionRate ?? 0}%`} icon={CheckCircle2} color="emerald" />
        <StatCard label="Upcoming" value={overview.upcoming ?? 0} icon={TrendingUp} color="violet" />
        <StatCard label="Cancellation Rate" value={`${overview.cancellationRate ?? 0}%`} icon={XCircle} color="red" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Interview Trends</h2>
          <p className="text-sm text-slate-400 mb-5">Daily activity over the last {period} days</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trends} margin={{ left: -20, right: 5 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                tickFormatter={v => v?.slice(5)} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2} fill="url(#grad1)" />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} fill="url(#grad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Interview Types</h2>
          <p className="text-sm text-slate-400 mb-5">Distribution by interview type</p>
          {funnel?.byType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnel.byType} margin={{ left: -20, right: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                  tickFormatter={v => v.replace('-', ' ')} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" name="Total" radius={[6, 6, 0, 0]}>
                  {funnel.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {feedbackStats && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Hiring Recommendations</h2>
            <p className="text-sm text-slate-400 mb-2">Feedback outcomes from all interviews</p>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-black text-slate-900">{feedbackStats.avgRating}</span>
                <span className="text-sm text-slate-400">/5 avg</span>
              </div>
              <span className="text-sm text-slate-400">from {feedbackStats.totalFeedbacks} feedbacks</span>
            </div>
            {feedbackStats.recommendations?.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={feedbackStats.recommendations} dataKey="count" nameKey="_id"
                    cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                    {feedbackStats.recommendations.map((entry, i) => (
                      <Cell key={i} fill={RECOMMENDATION_COLORS[entry._id] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val, name) => [val, RECOMMENDATION_LABELS[name] || name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend formatter={(val) => RECOMMENDATION_LABELS[val] || val} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No feedback data yet</div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Status Breakdown</h2>
          <p className="text-sm text-slate-400 mb-5">Current state of all interviews</p>
          {funnel?.byStatus?.length > 0 ? (
            <div className="space-y-3">
              {funnel.byStatus.map(({ _id: status, count }) => {
                const pct = Math.round((count / (overview.total || 1)) * 100);
                const colorMap = { scheduled: 'bg-blue-500', confirmed: 'bg-emerald-500', completed: 'bg-slate-400', cancelled: 'bg-red-500', rescheduled: 'bg-amber-500' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="capitalize font-medium text-slate-600">{status}</span>
                      <span className="font-bold text-slate-800">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${colorMap[status] || 'bg-brand-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {performance.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Interviewer Performance</h2>
          <p className="text-sm text-slate-400 mb-5">Interviews conducted and feedback submission rates</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Interviewer', 'Total', 'Completed', 'Cancelled', 'Feedback Rate'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {performance.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {p.interviewer?.firstName?.[0]}{p.interviewer?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.interviewer?.firstName} {p.interviewer?.lastName}</p>
                          <p className="text-xs text-slate-400">{p.interviewer?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-bold text-slate-800">{p.total}</td>
                    <td className="py-3.5 px-4 text-sm text-emerald-600 font-semibold">{p.completed}</td>
                    <td className="py-3.5 px-4 text-sm text-red-500 font-semibold">{p.cancelled}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px]">
                          <div className="h-full bg-brand-500 rounded-full"
                            style={{ width: `${p.total > 0 ? (p.feedbackRate / p.total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {p.total > 0 ? Math.round((p.feedbackRate / p.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
