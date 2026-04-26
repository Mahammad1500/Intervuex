import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm();

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

  const demoAccounts = [
    { role: 'Admin', email: 'admin@intervuex.com', password: 'Admin@12345' },
    { role: 'HR', email: 'hr@intervuex.com', password: 'Hr@123456' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
              From scheduling to meeting links to reminder emails — everything runs automatically.
            </p>
            <div className="mt-10 space-y-4">
              {['Instant conflict detection via Google Calendar', 'Real meeting links (Google Meet)', 'Automated emails and reminders'].map((f) => (
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

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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
              <label className="block text-sm font-medium text-slate-700">Password</label>
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

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(({ role, email, password }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemoAccount(email, password)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group"
                >
                  <p className="text-xs font-bold text-slate-700 group-hover:text-brand-700">{role}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{email}</p>
                  <p className="text-[10px] text-brand-600 mt-0.5">Click to fill credentials</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
