import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';
import { Toaster } from './components/ui/Toaster';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleAuthCallback = lazy(() => import('./pages/GoogleAuthCallback'));
const GoogleAuthComplete = lazy(() => import('./pages/GoogleAuthComplete'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ScheduleInterview = lazy(() => import('./pages/ScheduleInterview'));
const Interviews = lazy(() => import('./pages/Interviews'));
const InterviewDetail = lazy(() => import('./pages/InterviewDetail'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const Analytics = lazy(() => import('./pages/Analytics'));
const FeedbackPage = lazy(() => import('./pages/Feedback'));
const Users = lazy(() => import('./pages/Users'));
const Workspaces = lazy(() => import('./pages/Workspaces'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
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

/** Google complete may run while authenticated=false until space code is submitted */
const GoogleCompleteRoute = ({ children }) => children;

export default function App() {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/auth/google/complete" element={<GoogleCompleteRoute><GoogleAuthComplete /></GoogleCompleteRoute>} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/interviews" element={<ProtectedRoute roles={['admin', 'hr']}><Interviews /></ProtectedRoute>} />
            <Route path="/interviews/:id" element={<InterviewDetail />} />
            <Route path="/pipeline" element={<ProtectedRoute roles={['hr']}><Pipeline /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'hr']}><Analytics /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
            <Route path="/workspaces" element={<ProtectedRoute roles={['admin']}><Workspaces /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
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
