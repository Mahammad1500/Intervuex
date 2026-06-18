import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { feedbackAPI, interviewsAPI } from '../services/api';
import Button from '../components/ui/Button';
import { Select, Textarea } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';
import { formatDateTime } from '../lib/utils';

const RATING_CRITERIA = [
  { key: 'technicalSkills', label: 'Technical Skills' },
  { key: 'communication', label: 'Communication' },
  { key: 'problemSolving', label: 'Problem Solving' },
  { key: 'cultureFit', label: 'Culture Fit' },
  { key: 'experience', label: 'Relevant Experience' },
];

function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button key={n} type="button"
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="p-0.5"
          >
            <Star className={`w-6 h-6 transition-colors ${n <= (hovered || value) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
          </motion.button>
        ))}
        {value > 0 && <span className="ml-2 text-sm font-semibold text-slate-600 self-center">{value}/5</span>}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [criteriaRatings, setCriteriaRatings] = useState({});

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    interviewsAPI.getOne(interviewId)
      .then(({ data }) => setInterview(data.data.interview))
      .catch(() => toast.error('Interview not found'))
      .finally(() => setLoading(false));
  }, [interviewId]);

  const onSubmit = async (data) => {
    if (overallRating === 0) return toast.warning('Please provide an overall rating.');
    setSubmitting(true);
    try {
      await feedbackAPI.submit(interviewId, {
        ...data,
        overallRating,
        ratings: criteriaRatings,
      });
      setSubmitted(true);
      toast.success('Feedback submitted!', 'Thank you for your detailed assessment.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse max-w-2xl mx-auto" />;

  if (submitted) return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </motion.div>
      <h2 className="text-2xl font-black text-slate-900">Feedback Submitted!</h2>
      <p className="text-slate-500 mt-3">Your evaluation has been recorded. The HR team will review it shortly.</p>
      <Button className="mt-8" onClick={() => navigate('/interviews')}>Back to Interviews</Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)} />
        <div>
          <h1 className="text-xl font-black text-slate-900">Submit Feedback</h1>
          {interview && (
            <p className="text-sm text-slate-400 mt-0.5">
              {interview.role} · {interview.interviewType} · {formatDateTime(interview.scheduledAt)}
            </p>
          )}
        </div>
      </div>

      {interview?.candidate && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
            {interview.candidate.firstName?.[0]}{interview.candidate.lastName?.[0]}
          </div>
          <div>
            <p className="font-bold text-slate-900">{interview.candidate.firstName} {interview.candidate.lastName}</p>
            <p className="text-sm text-slate-400">{interview.candidate.email}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-900">Overall Assessment</h2>

          <StarRating label="Overall Rating *" value={overallRating} onChange={setOverallRating} />

          <Select label="Hiring Recommendation *" error={errors.recommendation?.message}
            {...register('recommendation', { required: 'Please select a recommendation' })}>
            <option value="">Select recommendation...</option>
            <option value="strong-hire">⭐ Strong Hire</option>
            <option value="hire">✅ Hire</option>
            <option value="neutral">➖ Neutral</option>
            <option value="no-hire">❌ No Hire</option>
            <option value="strong-no-hire">🚫 Strong No Hire</option>
          </Select>

          <Textarea label="Summary *" rows={4}
            placeholder="Provide a concise summary of the candidate's performance and key observations..."
            error={errors.summary?.message}
            {...register('summary', { required: 'Summary is required', minLength: { value: 50, message: 'Please provide at least 50 characters' } })} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">Criteria Ratings</h2>
          {RATING_CRITERIA.map(({ key, label }) => (
            <StarRating key={key} label={label}
              value={criteriaRatings[key] || 0}
              onChange={(val) => setCriteriaRatings(prev => ({ ...prev, [key]: val }))} />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">Detailed Feedback</h2>
          <Textarea label="Strengths" rows={3}
            placeholder="What did the candidate excel at? Specific examples..."
            {...register('strengths')} />
          <Textarea label="Areas of Improvement" rows={3}
            placeholder="What could the candidate work on? Constructive feedback..."
            {...register('areasOfImprovement')} />
          <Textarea label="Private Notes (visible to HR only)" rows={2}
            placeholder="Any confidential notes for the hiring team..."
            {...register('privateNotes')} />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={submitting} icon={Send}>Submit Feedback</Button>
        </div>
      </form>
    </div>
  );
}
