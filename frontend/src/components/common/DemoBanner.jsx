import useAuthStore from '../../store/authStore';

const DEMO_EMAILS = (import.meta.env.VITE_DEMO_VIEW_EMAILS || 'admin@intervuex.com,hr@intervuex.com')
  .split(',')
  .map((e) => e.trim().toLowerCase());

export default function DemoBanner() {
  const { user } = useAuthStore();
  const isDemo = import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true'
    && user?.email
    && DEMO_EMAILS.includes(user.email.toLowerCase());

  if (!isDemo) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-900 dark:text-amber-100">
      <strong>Live demo mode</strong> — browse all pages freely. Create, edit, and delete are disabled for demo accounts.
    </div>
  );
}
