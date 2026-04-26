import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function Card({ className, hover = false, children, ...props }) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover ? { whileHover: { y: -2 }, transition: { duration: 0.15 } } : {};
  return (
    <Component
      className={cn('bg-white rounded-2xl border border-slate-200/80 shadow-soft', hover && 'cursor-pointer', className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('p-6 pb-0', className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn('p-6', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-base font-semibold text-slate-900', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }) {
  return <p className={cn('text-sm text-slate-500 mt-1', className)} {...props}>{children}</p>;
}

export function StatCard({ label, value, icon: Icon, trend, trendLabel, color = 'brand', className }) {
  const colorMap = {
    brand: { bg: 'bg-brand-50', icon: 'text-brand-600', border: 'border-brand-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
    slate: { bg: 'bg-slate-50', icon: 'text-slate-600', border: 'border-slate-200' },
    violet: { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      className={cn('bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 card-3d', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {trendLabel && (
            <p className={cn('text-xs font-medium mt-2', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
            <Icon className={cn('w-6 h-6', c.icon)} strokeWidth={1.75} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
