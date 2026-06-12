import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { toast } from '../components/ui/Toaster';
import LoadingScreen from '../components/common/LoadingScreen';

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  useEffect(() => {
    const session = searchParams.get('session');
    const error = searchParams.get('error');
    if (error) {
      toast.error('Google sign-in failed. Try email and password instead.');
      navigate('/login', { replace: true });
      return;
    }
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      let b64 = session.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4;
      if (pad) b64 += '='.repeat(4 - pad);
      const parsed = JSON.parse(atob(b64));
      setSession(parsed);
      toast.success('Signed in with Google');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Could not complete Google sign-in');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setSession]);

  return <LoadingScreen message="Completing Google sign-in…" />;
}
