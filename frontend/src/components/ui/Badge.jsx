import { cn } from '../../lib/utils';
import { STATUS_CONFIG, INTERVIEW_TYPE_CONFIG, ROLE_CONFIG } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-brand-100 text-brand-700',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', config.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function InterviewTypeBadge({ type }) {
  const config = INTERVIEW_TYPE_CONFIG[type] || { label: type, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', config.color)}>
      {config.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || { label: role, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', config.color)}>
      {config.label}
    </span>
  );
}
