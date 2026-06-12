import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';

export default function GoogleAuthComplete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const signupToken = searchParams.get('token');
  const { completeGoogleSignup, isLoading } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!signupToken) {
      toast.error('Signup session expired. Please try Google sign-in again.');
      return;
    }
    const result = await completeGoogleSignup({ signupToken, spaceCode: data.spaceCode });
    if (result.success) {
      toast.success('Welcome to Intervuex!', 'Your HR account is ready.');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Could not complete signup');
    }
  };

  if (!signupToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-slate-600">Your Google signup session expired.</p>
          <Link to="/login" className="text-brand-600 font-semibold mt-4 inline-block">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-soft p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Complete your profile</h1>
            <p className="text-sm text-slate-500">Google verified your email — link your company workspace</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Company Space code"
            icon={KeyRound}
            placeholder="8 characters from your admin"
            error={errors.spaceCode?.message}
            {...register('spaceCode', {
              required: 'Space code is required',
              validate: (v) => {
                const t = String(v || '').replace(/[^A-Za-z0-9]/g, '');
                return t.length === 8 || 'Enter the 8-character code';
              },
            })}
          />
          <p className="text-xs text-slate-500 -mt-2">
            HR only — ask your platform admin for the Space code (Workspaces page).
          </p>
          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Join workspace
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
