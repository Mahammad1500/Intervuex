import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { auditAPI } from '../services/api';
import { formatDate } from '../lib/utils';
import { toast } from '../components/ui/Toaster';

const ACTION_LABELS = {
  user_created: 'User created',
  user_activated: 'User activated',
  user_deactivated: 'User deactivated',
  welcome_email_resent: 'Welcome email resent',
  workspace_created: 'Workspace created',
  workspace_deleted: 'Workspace deleted',
  password_reset_requested: 'Password reset requested',
  password_reset_completed: 'Password reset completed',
  user_google_signup: 'Google signup completed',
  user_deleted: 'User deleted',
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    auditAPI.getAll({ limit: 100 })
      .then((r) => setLogs(r.data.data?.logs || []))
      .catch(() => toast.error('Could not load audit log'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-brand-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audit log</h1>
          <p className="text-sm text-slate-500">Admin actions across workspaces and users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 animate-pulse">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No audit events yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Actor</th>
                  <th className="px-5 py-3">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{ACTION_LABELS[log.action] || log.action}</td>
                    <td className="px-5 py-3 text-slate-600">{log.actorEmail || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{log.targetLabel || log.targetId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
