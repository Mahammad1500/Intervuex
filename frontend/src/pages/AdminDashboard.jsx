import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Video, Users, Building2, Clock, ArrowRight, TrendingUp, Copy, Pencil, Plus
} from 'lucide-react';
import { analyticsAPI, companiesAPI } from '../services/api';
import { StatCard } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { formatDate } from '../lib/utils';
import useAuthStore from '../store/authStore';
import { toast } from '../components/ui/Toaster';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [hrCount, setHrCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [savingCode, setSavingCode] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: '', spaceCode: '' },
  });
  const { register: regCode, handleSubmit: submitCode, formState: { errors: errCode }, reset: resetCode } = useForm({
    defaultValues: { spaceCode: '' },
  });

  const fetchCompanies = useCallback(() => {
    companiesAPI
      .getAll({ limit: 40, page: 1 })
      .then((res) => {
        setCompanies(res.data.data?.companies || []);
        setCompanyCount(res.data.data?.pagination?.total || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getDashboard(),
      analyticsAPI.getTrends({ period: '14d', groupBy: 'day' }),
      companiesAPI.getAll({ limit: 1 }),
    ]).then(([statsRes, trendsRes, companiesRes]) => {
      const data = statsRes.data.data;
      setStats(data);
      setTrends(trendsRes.data.data);
      setRecentActivity(data.recentInterviews || []);
      setCompanyCount(companiesRes.data.data.pagination?.total || 0);
      setHrCount(data.users?.totalHR || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (editTarget?.spaceCode) {
      resetCode({ spaceCode: editTarget.spaceCode });
    }
  }, [editTarget, resetCode]);

  const onCreateCompany = async (form) => {
    setCreating(true);
    try {
      const payload = { name: form.name?.trim() };
      const raw = form.spaceCode?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (raw && raw.length === 8) payload.spaceCode = raw;
      if (raw && raw.length > 0 && raw.length !== 8) {
        toast.error('Custom space code must be exactly 8 characters, or leave blank to auto-generate.');
        setCreating(false);
        return;
      }
      await companiesAPI.create(payload);
      toast.success('Workspace created. Share the Space code with your HR team.');
      setCreateModal(false);
      reset();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create workspace');
    } finally {
      setCreating(false);
    }
  };

  const onUpdateSpaceCode = async (form) => {
    if (!editTarget) return;
    const raw = form.spaceCode?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length !== 8) {
      toast.error('Space code must be exactly 8 letters or numbers.');
      return;
    }
    setSavingCode(true);
    try {
      await companiesAPI.updateSpaceCode(editTarget._id, raw);
      toast.success('Space code updated. Inform HRs who have not yet registered.');
      setEditTarget(null);
      resetCode();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingCode(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Space code copied');
    } catch {
      toast.error('Copy failed');
    }
  };

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
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
          <p className="text-slate-500 mt-1 text-sm max-w-xl">
            Manage <strong>workspaces</strong>, <strong>Space codes</strong>, and <strong>who can sign in</strong>. Activity below is across all companies; open <em>Interviews</em> for single-round detail.
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Interviews" value={overview.total ?? 0} icon={Video} color="brand" />
        <StatCard label="Active HR Users" value={hrCount} icon={Users} color="violet" />
        <StatCard label="Companies" value={companyCount} icon={Building2} color="emerald" />
        <StatCard label="Completed" value={overview.completed ?? 0} icon={Clock} color="slate" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 card-3d">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Company-wide Interview Activity</h2>
              <p className="text-sm text-slate-400 mt-0.5">Last 14 days across all workspaces</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-brand-400 inline-block" /> Total</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-400 inline-block" /> Completed</span>
            </div>
          </div>
          {(!trends || trends.length === 0 || trends.every(t => !t.total && !t.completed)) ? (
            <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-slate-200 rounded-xl">
              <TrendingUp className="w-8 h-8 text-brand-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">No interview activity yet</p>
              <p className="text-xs text-slate-400 mt-1">Interviews will appear once HR teams start scheduling</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#totalGrad)" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="url(#completedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 card-3d">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Performance</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Completion Rate', value: overview.completionRate ?? 0, color: 'bg-emerald-500' },
              { label: 'Cancellation Rate', value: overview.cancellationRate ?? 0, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-slate-900 font-bold">{Math.round(value)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} className={`h-full rounded-full ${color}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-brand-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-brand-700">{overview.upcoming ?? 0}</p>
                <p className="text-xs text-brand-500 mt-0.5 font-medium">Upcoming</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-emerald-700">{overview.thisMonth ?? 0}</p>
                <p className="text-xs text-emerald-500 mt-0.5 font-medium">This Month</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden card-3d">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Workspaces (companies)</h2>
            <p className="text-sm text-slate-500 mt-0.5">Space codes let HRs self-register into the correct company</p>
          </div>
          <Button size="sm" icon={Plus} onClick={() => { reset(); setCreateModal(true); }}>
            Add workspace
          </Button>
        </div>
        <div className="p-0 overflow-x-auto">
          {companies.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">No companies yet. Create a workspace to get a Space code.</div>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Space code</th>
                  <th className="px-5 py-3">Active HR</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">Since {c.createdAt ? formatDate(c.createdAt) : '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-sm font-mono font-bold tracking-widest text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                        {c.spaceCode}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{c.hrCount ?? 0}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" type="button" icon={Copy} onClick={() => copyCode(c.spaceCode)} />
                        <Button variant="ghost" size="sm" type="button" icon={Pencil} onClick={() => setEditTarget(c)} title="Change space code" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      <Modal
        open={createModal}
        onClose={() => { setCreateModal(false); reset(); }}
        title="Add workspace"
        description="Creates a new company. You can set a custom 8-character Space code or leave it blank to auto-generate one."
        size="md"
      >
        <form onSubmit={handleSubmit(onCreateCompany)} className="p-6 pt-2 space-y-4">
          <Input
            label="Company name"
            placeholder="e.g. Acme Corp"
            error={errors.name?.message}
            {...register('name', { required: 'Company name is required' })}
          />
          <Input
            label="Custom Space code (optional)"
            placeholder="8 characters, letters A–Z and numbers"
            error={errors.spaceCode?.message}
            {...register('spaceCode', {
              validate: (v) => {
                if (!v || !String(v).trim()) return true;
                const t = String(v).replace(/[^A-Za-z0-9]/g, '');
                return t.length === 0 || t.length === 8 || 'Must be exactly 8 letters/numbers, or leave blank';
              }
            })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={creating}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => { setEditTarget(null); resetCode(); }}
        title="Change Space code"
        description="All new HR registrations will need this updated code. Tell existing users only if you change it."
        size="sm"
      >
        {editTarget && (
          <form onSubmit={submitCode(onUpdateSpaceCode)} className="p-6 pt-2 space-y-4">
            <p className="text-sm text-slate-600">Company: <strong>{editTarget.name}</strong></p>
            <Input
              label="New Space code (8 characters)"
              error={errCode.spaceCode?.message}
              {...regCode('spaceCode', {
                required: 'Required',
                validate: (v) => {
                  const t = String(v || '').replace(/[^A-Za-z0-9]/g, '');
                  return t.length === 8 || 'Use exactly 8 letters or numbers';
                }
              })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" type="button" onClick={() => { setEditTarget(null); resetCode(); }}>Cancel</Button>
              <Button type="submit" loading={savingCode}>Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <motion.div variants={fadeUp} className="bg-white rounded-2xl border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Latest schedule changes</h2>
            <p className="text-xs text-slate-400 mt-0.5">A quick pulse — for deep search use Interviews in the nav.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/users')}>
              Team & companies
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/schedule')} className="text-brand-600">
              Admin schedule
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Activity will appear as HR teams schedule interviews</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((interview) => (
                <div key={interview._id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors"
                  onClick={() => navigate(`/interviews/${interview._id}`)}>
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">
                      {interview.scheduledBy?.firstName || 'HR'} scheduled a <span className="text-brand-600 capitalize">{interview.interviewType}</span> round for <span className="font-semibold">{interview.role}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {interview.candidateName || interview.candidateEmail} · {formatDate(interview.scheduledAt)}
                    </p>
                  </div>
                  <StatusBadge status={interview.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
