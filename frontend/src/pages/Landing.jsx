import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, Calendar, Video, Bell, BarChart3, Shield, ArrowRight,
  CheckCircle2, Users, Clock, Globe, Sparkles, ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const FEATURES = [
  { icon: Zap, title: 'One-Click Scheduling', desc: 'Enter emails, role, and duration. Intervuex handles the rest — conflicts, calendar, meeting link, and emails.', color: 'brand' },
  { icon: Calendar, title: 'Calendar Sync', desc: 'Real-time availability checking via Google Calendar. Never double-book interview schedules again.', color: 'emerald' },
  { icon: Video, title: 'Real Meeting Links', desc: 'Generate authentic Google Meet links via official OAuth APIs — zero placeholders.', color: 'blue' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Automated email notifications and reminders at 24h, 1h, and 15min before every interview.', color: 'violet' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track hiring velocity, interviewer performance, completion rates, and funnel metrics in real time.', color: 'amber' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Two secure roles: Admin and HR — each with tailored views and permissions.', color: 'rose' },
];

const STEPS = [
  { step: '01', title: 'Enter Details', desc: 'Input candidate email, interviewer email, role, interview type, and desired duration.' },
  { step: '02', title: 'Auto Conflict Check', desc: 'System queries Google Calendar to detect scheduling conflicts in real time.' },
  { step: '03', title: 'Generate Meeting', desc: 'A real meeting link is created via Google Meet using OAuth.' },
  { step: '04', title: 'Notify Everyone', desc: 'Calendar invites, meeting links, and detailed emails are sent automatically to all parties.' },
];

const STATS = [
  { value: '90%', label: 'Reduction in scheduling time' },
  { value: '1 API', label: 'Google Meet integration' },
  { value: '2 Roles', label: 'Granular access control' },
  { value: '24/7', label: 'Automated reminders' },
];

const colorIconBg = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-brand-glow">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold gradient-text">Intervuex</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it Works</button>
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</button>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-brand-100/60 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Fully Automated Interview Scheduling
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] text-balance">
            Schedule Interviews<br />
            <span className="gradient-text">in Seconds.</span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Intervuex automates the entire interview workflow — from availability detection to calendar creation and real meeting links — so your HR team can focus on hiring the best talent.
          </motion.p>
          <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.5 }} className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button size="xl" onClick={() => navigate('/register')} className="gap-3">
              Start Scheduling Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="xl" onClick={() => navigate('/login')}>
              Sign In to Dashboard
            </Button>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.4, duration: 0.5 }} className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            {['No credit card required', 'Google Calendar integration', 'Real meeting links'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-3 text-slate-400 text-sm font-mono">intervuex — schedule.js</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-400 text-xs mb-3 font-mono uppercase tracking-wider">Scheduling Request</p>
                  {[
                    ['candidateEmail', 'sarah.johnson@email.com'],
                    ['interviewerEmail', 'alex.chen@company.com'],
                    ['role', 'Senior Backend Engineer'],
                    ['interviewType', 'technical'],
                    ['duration', '60 minutes'],
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm py-1">
                      <span className="text-brand-400 font-mono">{key}</span>
                      <span className="text-emerald-400 font-mono text-right max-w-[55%] truncate">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: '✓', label: 'Conflict check passed', color: 'text-emerald-400' },
                  { icon: '✓', label: 'Google Meet link generated', color: 'text-emerald-400' },
                  { icon: '✓', label: 'Calendar event created', color: 'text-emerald-400' },
                  { icon: '✓', label: 'Candidate email sent', color: 'text-emerald-400' },
                  { icon: '✓', label: 'Interviewer notified', color: 'text-emerald-400' },
                  { icon: '⏱', label: 'Reminders scheduled (24h, 1h, 15m)', color: 'text-amber-400' },
                ].map(({ icon, label, color }, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className={`${color} font-bold w-5`}>{icon}</span>
                    <span className="text-slate-300">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-16 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-black gradient-text">{value}</p>
                <p className="text-sm text-slate-400 mt-2 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to hire faster</h2>
            <p className="text-lg text-slate-500 mt-4 max-w-2xl mx-auto">A complete automation stack for enterprise-grade interview scheduling.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition-all duration-200 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorIconBg[color]}`}>
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">From input to interview in 4 steps</h2>
            <p className="text-lg text-slate-500 mt-4">The entire workflow is automated. HR enters the details — Intervuex does the rest.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map(({ step, title, desc }, i) => (
              <motion.div key={step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50"
              >
                <span className="text-5xl font-black text-slate-100 absolute top-4 right-5 select-none">{step}</span>
                <div className="relative">
                  <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-gradient-to-br from-brand-600 to-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">Ready to automate your hiring?</h2>
          <p className="text-brand-100 mt-4 text-lg">Join teams who cut interview scheduling time by 90%.</p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Button size="xl" variant="secondary" onClick={() => navigate('/register')} className="text-brand-700">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold">Intervuex</span>
          </div>
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Intervuex. Built for modern hiring teams.</p>
        </div>
      </footer>
    </div>
  );
}
