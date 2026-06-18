import useAuthStore from '../store/authStore';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'admin') return <AdminDashboard />;
  return <HRDashboard />;
}
