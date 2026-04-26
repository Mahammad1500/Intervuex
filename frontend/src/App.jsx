import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';
import { Toaster } from './components/ui/Toaster';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ScheduleInterview = lazy(() => import('./pages/ScheduleInterview'));
const Interviews = lazy(() => import('./pages/Interviews'));
const InterviewDetail = lazy(() => import('./pages/InterviewDetail'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const Analytics = lazy(() => import('./pages/Analytics'));
const FeedbackPage = lazy(() => import('./pages/Feedback'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interviews" element={<ProtectedRoute roles={['admin', 'hr']}><Interviews /></ProtectedRoute>} />
            <Route path="/interviews/:id" element={<InterviewDetail />} />
            <Route path="/pipeline" element={<ProtectedRoute roles={['hr']}><Pipeline /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute roles={['hr']}><CalendarView /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'hr']}><Analytics /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute roles={['admin', 'hr']}><ScheduleInterview /></ProtectedRoute>} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}
