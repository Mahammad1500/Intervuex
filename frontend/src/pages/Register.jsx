import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ defaultValues: { role: 'hr' } });

  useEffect(() => {
    const fromQuery = searchParams.get('code') || searchParams.get('space') || searchParams.get('spaceCode');
    if (fromQuery) {
      const code = fromQuery.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
      if (code.length === 8) setValue('spaceCode', code);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      toast.success('Account created!', 'Welcome to Intervuex');
      navigate('/dashboard');
    } else {
      toast.error(result.message, 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <img src="/assets/IntervuexLogo.png" alt="Intervuex" className="w-9 h-9 rounded-xl object-contain" />
          <span className="text-xl font-bold gradient-text">Intervuex</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900">Join your Company</h1>
            <p className="text-slate-500 text-sm mt-1">Register as HR using your company's Space Code</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                label="Space Code"
                placeholder="e.g. ABCD1234 (8 characters)"
                error={errors.spaceCode?.message}
                {...register('spaceCode', { required: 'Space Code is required. Get it from your admin or HR lead.' })}
              />
              <p className="text-xs text-slate-400">
                If you received an invite link, the code may be filled in automatically. Format: 8 letters or numbers (A–Z, 0–9).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName', { required: 'Required' })}
              />
              <Input
                label="Last name"
                placeholder="Smith"
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Required' })}
              />
            </div>

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

            <input type="hidden" value="hr" {...register('role')} />
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <p className="text-sm text-brand-700 font-medium">✓ Registering as HR Manager</p>
              <p className="text-xs text-brand-600 mt-1">Your admin provides the Space Code when they create your company workspace.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars, uppercase & number"
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-slate-300 transition-all"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Must contain uppercase, lowercase, and number'
                    }
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-400 mb-3">
                By creating an account you agree to our{' '}
                <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
