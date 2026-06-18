import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSent(true);
      toast.success('Check your email', 'If the account exists, we sent a reset link.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
          <h1 className="text-2xl font-black text-slate-900">Forgot password?</h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter your email and we will send a reset link (valid 1 hour).
          </p>
          {sent ? (
            <p className="mt-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              If an account exists for that email, a reset link was sent. Check spam folder too.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <Input label="Email" type="email" icon={Mail} error={errors.email?.message}
                {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
              <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
