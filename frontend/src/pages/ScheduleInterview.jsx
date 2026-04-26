import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Mail, Clock, Briefcase, Video, Calendar, ChevronRight,
  CheckCircle2, AlertTriangle, Zap, RefreshCw
} from 'lucide-react';
import { interviewsAPI, companiesAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { Input, Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toaster';
import { formatDateTime, formatApiError } from '../lib/utils';

const STEPS = ['Details', 'Schedule', 'Platform', 'Review'];

const INTERVIEW_TYPES = [
  { value: 'screening', label: 'Screening' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'system-design', label: 'System Design' },
  { value: 'hr', label: 'HR Round' },
  { value: 'final', label: 'Final Round' },
];

const DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes — Recommended' },
  { value: '90', label: '90 minutes' },
  { value: '120', label: '2 hours' },
];

const PLATFORMS = [
  { value: 'google-meet', label: 'Google Meet', desc: 'Auto-generate a real Google Meet link (requires Google Calendar connected in Settings)', icon: '🎥', color: 'border-emerald-200 bg-emerald-50' },
  { value: 'manual', label: 'Manual Link', desc: 'No link generated now — you can paste a meeting link later from the interview detail page', icon: '🔗', color: 'border-slate-200 bg-slate-50' },
];

export default function ScheduleInterview() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conflictWarning, setConflictWarning] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('manual');
  const [companies, setCompanies] = useState([]);

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, trigger } = useForm({
    defaultValues: {
      duration: '60',
      interviewType: 'technical',
      meetingPlatform: 'manual',
      timezone: 'Asia/Kolkata',
    },
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      companiesAPI.getAll({ limit: 100 }).then((r) => setCompanies(r.data.data?.companies || [])).catch(() => {});
    }
  }, [user?.role]);

  const nextStep = async () => {
    const step0 = user?.role === 'admin'
      ? ['companyId', 'candidateEmail', 'interviewerEmail', 'role', 'interviewType']
      : ['candidateEmail', 'interviewerEmail', 'role', 'interviewType'];
    const fieldsPerStep = [
      step0,
      ['scheduledAt', 'duration', 'timezone'],
      ['meetingPlatform'],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setConflictWarning(null);
    try {
      const durationNum = parseInt(String(data.duration ?? 60), 10);
      const payload = {
        ...data,
        meetingPlatform: selectedPlatform,
        duration: Number.isFinite(durationNum) ? durationNum : 60,
        scheduledAt: data.scheduledAt
          ? new Date(data.scheduledAt).toISOString()
          : data.scheduledAt,
      };
      if (user?.role !== 'admin') delete payload.companyId;
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      if (user?.role === 'admin' && !payload.companyId) {
        toast.error('Choose a company workspace for this interview');
        setLoading(false);
        return;
      }
      if (selectedPlatform === 'manual' && !payload.meetingLink) delete payload.meetingLink;
      if (selectedPlatform === 'google-meet') delete payload.meetingLink;
      const res = await interviewsAPI.schedule(payload);
      toast.success('Interview scheduled!', 'Email invitations have been sent to both participants.');
      navigate(`/interviews/${res.data.data.interview._id}`);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictWarning(err.response.data.message);
        toast.warning('Scheduling conflict detected', 'Please choose a different time slot.');
        setStep(1);
      } else {
        toast.error(formatApiError(err, 'Scheduling failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const values = getValues();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Schedule Interview</h1>
        <p className="text-slate-500 mt-1">Fill in the details and Intervuex handles everything else automatically.</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-slate-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-brand-500 text-white' : i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300' : 'bg-slate-100 text-slate-400'
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-brand-700' : ''}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-brand-500' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5 card-3d"
        >
          {step === 0 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Interview Details</h2>
                  <p className="text-xs text-slate-400">Connect candidate, interviewer, and role — the core of every round.</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <Select
                  label="Company workspace"
                  error={errors.companyId?.message}
                  {...register('companyId', { required: 'Select a company' })}
                >
                  <option value="">Select company (required for admin)...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name} · {c.spaceCode}</option>
                  ))}
                </Select>
              )}
              <Input label="Candidate Email" type="email" icon={Mail} placeholder="candidate@email.com"
                error={errors.candidateEmail?.message}
                hint="An email invitation will be sent to this address"
                {...register('candidateEmail', { required: 'Candidate email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
              <Input label="Candidate Name (Optional)" placeholder="John Doe"
                {...register('candidateName')} />
              <Input label="Interviewer Email" type="email" icon={Mail} placeholder="interviewer@company.com"
                error={errors.interviewerEmail?.message}
                hint="An email invitation will be sent to this address"
                {...register('interviewerEmail', { required: 'Interviewer email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
              <Input label="Interviewer Name (Optional)" placeholder="Jane Smith"
                {...register('interviewerName')} />
              <Input label="Role / Position" icon={Briefcase} placeholder="e.g. Senior Frontend Engineer"
                error={errors.role?.message}
                {...register('role', { required: 'Role is required', minLength: { value: 3, message: 'Role must be at least 3 characters' } })} />
              <Select label="Interview Type" error={errors.interviewType?.message}
                {...register('interviewType', { required: 'Interview type is required' })}>
                {INTERVIEW_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
              <Textarea label="Notes (Optional)" placeholder="Preparation instructions, topics to cover, context for the interviewer..." rows={3} {...register('notes')} />
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Date & Time</h2>
                  <p className="text-xs text-slate-400">When should the interview take place?</p>
                </div>
              </div>

              {conflictWarning && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Scheduling Conflict</p>
                    <p className="text-xs text-amber-700 mt-1">{conflictWarning}</p>
                    <p className="text-xs text-amber-600 mt-2">Please choose a different time.</p>
                  </div>
                </motion.div>
              )}

              <Input label="Date & Time" type="datetime-local" icon={Calendar}
                error={errors.scheduledAt?.message}
                min={new Date().toISOString().slice(0, 16)}
                {...register('scheduledAt', { required: 'Date and time is required' })} />

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Quick suggestions (tomorrow):</p>
                <div className="flex flex-wrap gap-2">
                  {['09:00', '11:00', '14:00', '16:00'].map((time, i) => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]), 0, 0);
                    return (
                      <button key={i} type="button"
                        onClick={() => setValue('scheduledAt', tomorrow.toISOString().slice(0, 16))}
                        className="text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors">
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Select label="Duration" error={errors.duration?.message}
                {...register('duration', { required: true })}>
                {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </Select>

              <Select label="Timezone" {...register('timezone')}>
                {[
                  ['Asia/Kolkata', 'India (IST) — Asia/Kolkata'],
                  ['UTC', 'UTC'],
                  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
                  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
                  'Asia/Singapore', 'Australia/Sydney', 'Pacific/Auckland',
                ].map((tz) => {
                  const v = Array.isArray(tz) ? tz[0] : tz;
                  const l = Array.isArray(tz) ? tz[1] : tz;
                  return <option key={v} value={v}>{l}</option>;
                })}
              </Select>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Meeting Platform</h2>
                  <p className="text-xs text-slate-400">Select how the interview will be conducted</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORMS.map(({ value, label, desc, icon, color }) => (
                  <motion.div key={value} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedPlatform(value); setValue('meetingPlatform', value); }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlatform === value ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/10' : `border-slate-200 hover:${color}`
                    }`}>
                    <span className="text-2xl">{icon}</span>
                    <p className="text-sm font-bold text-slate-800 mt-2">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                    {selectedPlatform === value && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                        <span className="text-xs text-brand-600 font-semibold">Selected</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {selectedPlatform === 'manual' && (
                <Input
                  label="Meeting link (paste now, or add from interview page later)"
                  type="url"
                  placeholder="https://meet.google.com/xxx or https://zoom.us/j/..."
                  {...register('meetingLink')}
                  hint="If you already have a Zoom, Meet, or Teams link, add it here so it goes in invitation emails."
                />
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Google Meet:</span> connect Google Calendar in Settings first. <span className="font-semibold text-slate-700">Manual:</span> you can always paste a link in the last step, or after scheduling.
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Review & Confirm</h2>
                  <p className="text-xs text-slate-400">Verify all details before scheduling</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                {[
                  ['Candidate Email', values.candidateEmail],
                  ...(values.candidateName ? [['Candidate Name', values.candidateName]] : []),
                  ['Interviewer Email', values.interviewerEmail],
                  ...(values.interviewerName ? [['Interviewer Name', values.interviewerName]] : []),
                  ['Role', values.role],
                  ['Interview Type', INTERVIEW_TYPES.find(t => t.value === values.interviewType)?.label],
                  ['Date & Time', values.scheduledAt ? formatDateTime(values.scheduledAt) : '—'],
                  ['Duration', DURATIONS.find(d => d.value === values.duration)?.label],
                  ['Timezone', values.timezone || 'Asia/Kolkata'],
                  ['Platform', PLATFORMS.find(p => p.value === selectedPlatform)?.label],
                  ...(values.meetingLink && selectedPlatform === 'manual' ? [['Meeting link', values.meetingLink]] : []),
                  ...(values.notes ? [['Notes', values.notes]] : []),
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-start px-4 py-3">
                    <span className="text-sm text-slate-500 font-medium">{label}</span>
                    <span className="text-sm text-slate-900 font-semibold text-right max-w-[60%]">{val || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                <p className="text-xs text-brand-700 font-medium leading-relaxed">
                  After scheduling, Intervuex will send email invitations to both the candidate and interviewer with all interview details{selectedPlatform === 'google-meet' ? ' and a Google Meet link' : ''}.
                </p>
              </div>
            </>
          )}
        </motion.div>

        <div className="flex items-center justify-between mt-6">
          <Button type="button" variant="secondary" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(user?.role === 'admin' ? '/interviews' : '/pipeline')}
            disabled={loading}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" loading={loading} icon={Zap}>
              Schedule Interview
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
