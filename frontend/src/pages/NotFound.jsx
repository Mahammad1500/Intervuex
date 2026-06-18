import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Zap } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-brand-glow">
          <Zap className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-8xl font-black gradient-text leading-none">404</h1>
        <h2 className="text-2xl font-black text-slate-900 mt-4">Page not found</h2>
        <p className="text-slate-500 mt-3 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>Go Back</Button>
          <Button icon={Home} onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </motion.div>
    </div>
  );
}
