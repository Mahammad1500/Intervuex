import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      toast.success('Password updated', 'You can log in now.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-slate-600">Invalid or missing reset token. <Link to="/forgot-password" className="text-brand-600">Request a new link</Link></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
          <h1 className="text-2xl font-black text-slate-900">Set new password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input label="New password" type="password" icon={Lock} error={errors.password?.message}
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'Min 8 characters' },
                pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Include upper, lower, and number' },
              })} />
            <Input label="Confirm password" type="password" error={errors.confirm?.message}
              {...register('confirm', {
                required: 'Confirm your password',
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })} />
            <Button type="submit" className="w-full" loading={loading}>Update password</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
