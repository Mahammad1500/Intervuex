import useAuthStore from '../../store/authStore';
import { isUiDemoMode, isDemoSite, DEMO_ACCOUNTS } from '../../demo/config';

const DEMO_EMAILS = DEMO_ACCOUNTS.map((a) => a.email.toLowerCase());

export default function DemoBanner() {
  const { user } = useAuthStore();
  const uiDemo = isUiDemoMode();
  const isDemo = (uiDemo || isDemoSite())
    && user?.email
    && DEMO_EMAILS.includes(user.email.toLowerCase());

  if (!isDemo) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center text-sm text-amber-900 dark:text-amber-100">
      {uiDemo ? (
        <>
          <strong>UI preview mode</strong> — sample data only, no backend. Browse freely; saves and deletes are disabled.
        </>
      ) : (
        <>
          <strong>Live demo mode</strong> — browse all pages freely. Create, edit, and delete are disabled for demo accounts.
        </>
      )}
    </div>
  );
}
