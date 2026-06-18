import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { authAPI } from '../services/api';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm();

  useEffect(() => {
    authAPI.googleStatus().then((r) => setGoogleEnabled(r.data.data?.enabled)).catch(() => {});
  }, []);

  const onGoogleLogin = () => {
    const base = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${base.replace(/\/$/, '')}/auth/google`;
  };

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Logged in successfully', 'Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message, 'Login failed');
    }
  };

  const fillDemoAccount = (email, password) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('password', password, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    clearErrors();
  };

  const showDemoLogin = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';
  const isLiveDemo = import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true' && !import.meta.env.DEV;

  const demoAccounts = [
    { role: 'Admin', email: 'admin@intervuex.com', password: 'Admin@12345' },
    { role: 'HR', email: 'hr@intervuex.com', password: 'Hr@123456' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle size="sm" />
      </div>
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/20"
              style={{ width: `${40 + i * 30}px`, height: `${40 + i * 30}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }} />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/IntervuexLogo.png" alt="Intervuex" className="w-10 h-10 rounded-xl object-contain" />
            <span className="text-xl font-bold text-white">Intervuex</span>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Automate your<br />interview pipeline
            </h2>
            <p className="text-brand-200 mt-4 text-lg leading-relaxed">
              Schedule panel rounds, notify everyone by email, and track hiring in one place.
            </p>
            <div className="mt-10 space-y-4">
              {['Multi-interviewer panel rounds', 'Workspace Space codes for HR teams', 'Automated email invitations & reminders'].map((f) => (
                <div key={f} className="flex items-center gap-3 text-brand-100 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/assets/IntervuexLogo.png" alt="Intervuex" className="w-9 h-9 rounded-xl object-contain" />
            <span className="text-xl font-bold gradient-text">Intervuex</span>
          </div>

          <div>
            <h1 className="text-3xl font-black text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to your Intervuex account</p>
          </div>

          {googleEnabled && (
            <div className="mt-6">
              <Button type="button" variant="secondary" className="w-full gap-3" onClick={onGoogleLogin}>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400">or email</span></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              icon={Mail}
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
              })}
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 font-medium hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all"
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {showDemoLogin && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">
              {isLiveDemo ? 'Live demo — click to sign in' : 'Demo accounts (local dev)'}
            </p>
            {isLiveDemo && (
              <p className="text-xs text-slate-500 mb-3">Browse only — changes are disabled on the demo site.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(({ role, email, password }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemoAccount(email, password)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all text-left group"
                >
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-700">{role}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{email}</p>
                </button>
              ))}
            </div>
          </div>
          )}

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
