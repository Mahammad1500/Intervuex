import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    ...opts,
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(date));
};

export const formatTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(date));
};

export const getRelativeTime = (date) => {
  if (!date) return '—';
  const now = new Date();
  const d = new Date(date);
  const diffMs = d - now;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);
  if (Math.abs(diffMins) < 60) return diffMins > 0 ? `in ${diffMins}m` : `${Math.abs(diffMins)}m ago`;
  if (Math.abs(diffHours) < 24) return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
  return diffDays > 0 ? `in ${diffDays}d` : `${Math.abs(diffDays)}d ago`;
};

/** First API error line, or field-level messages from 400 validation */
export const formatApiError = (err, fallback = 'Something went wrong') => {
  const d = err?.response?.data;
  if (!d) return err?.message || fallback;
  if (Array.isArray(d.errors) && d.errors.length) {
    const parts = d.errors
      .map((e) => (typeof e === 'string' ? e : e?.message || e?.msg))
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
  }
  return d.message || fallback;
};

export const STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  rescheduled: { label: 'Rescheduled', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'no-show': { label: 'No Show', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

export const INTERVIEW_TYPE_CONFIG = {
  technical: { label: 'Technical', color: 'bg-indigo-100 text-indigo-700' },
  behavioral: { label: 'Behavioral', color: 'bg-purple-100 text-purple-700' },
  'system-design': { label: 'System Design', color: 'bg-cyan-100 text-cyan-700' },
  hr: { label: 'HR Round', color: 'bg-pink-100 text-pink-700' },
  final: { label: 'Final Round', color: 'bg-amber-100 text-amber-700' },
  screening: { label: 'Screening', color: 'bg-teal-100 text-teal-700' },
};

export const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'bg-rose-100 text-rose-700' },
  hr: { label: 'HR', color: 'bg-violet-100 text-violet-700' },
  interviewer: { label: 'Interviewer', color: 'bg-blue-100 text-blue-700' },
  candidate: { label: 'Candidate', color: 'bg-emerald-100 text-emerald-700' },
};

export const PLATFORM_CONFIG = {
  'google-meet': { label: 'Google Meet', icon: '🎥', color: 'text-emerald-600' },
  'microsoft-teams': { label: 'Microsoft Teams', icon: '💼', color: 'text-blue-600' },
  'zoom': { label: 'Zoom', icon: '📹', color: 'text-blue-500' },
  'manual': { label: 'Manual', icon: '🔗', color: 'text-slate-500' },
};
