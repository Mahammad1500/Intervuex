import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Clock, Video, User, MapPin, ExternalLink,
  CheckCircle2, XCircle, RefreshCw, MessageSquare, Copy, Check, Save, Link2, Pencil
} from 'lucide-react';
import { interviewsAPI } from '../services/api';
import { StatusBadge, InterviewTypeBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { toast } from '../components/ui/Toaster';
import { formatDateTime, formatDate, PLATFORM_CONFIG } from '../lib/utils';
import useAuthStore from '../store/authStore';
import Modal from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const { register, handleSubmit, reset, formState: { errors: editErrors } } = useForm();

  useEffect(() => {
    interviewsAPI.getOne(id)
      .then((res) => setInterview(res.data.data.interview))
      .catch(() => toast.error('Failed to load interview'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (interview?.title) {
      document.title = `${interview.title} | Intervuex`;
    }
    return () => { document.title = 'Intervuex'; };
  }, [interview?.title]);

  const copyLink = () => {
    if (interview?.meetingLink) {
      navigator.clipboard.writeText(interview.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Meeting link copied!');
    }
  };

  const handleCancel = async () => {
    if (cancelReason.length < 10) return toast.warning('Please provide a reason (at least 10 characters).');
    setActionLoading(true);
    try {
      await interviewsAPI.cancel(id, cancelReason);
      setInterview(prev => ({ ...prev, status: 'cancelled' }));
      setCancelModal(false);
      setCancelReason('');
      toast.success('Interview cancelled', 'All participants have been notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally { setActionLoading(false); }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) return toast.warning('Please select a new date and time.');
    setActionLoading(true);
    try {
      const res = await interviewsAPI.reschedule(id, { scheduledAt: rescheduleDate, duration: interview.duration });
      setRescheduleModal(false);
      toast.success('Interview rescheduled!', 'Updated invitations have been sent.');
      navigate(`/interviews/${res.data.data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reschedule failed');
    } finally { setActionLoading(false); }
  };

  const saveMeetingLink = async () => {
    if (!meetingLinkInput.trim()) return;
    setSavingLink(true);
    try {
      const res = await interviewsAPI.updateMeetingLink(id, meetingLinkInput.trim());
      setInterview(prev => ({ ...prev, meetingLink: res.data.data.interview.meetingLink }));
      setMeetingLinkInput('');
      toast.success('Meeting link saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save meeting link');
    } finally { setSavingLink(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-slate-100 rounded-lg animate-pulse" />
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  );

  if (!interview) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Interview not found.</p>
      <Button variant="secondary" className="mt-4" onClick={() => navigate(user?.role === 'hr' ? '/pipeline' : '/interviews')}>Back</Button>
    </div>
  );

  const platform = PLATFORM_CONFIG[interview.meetingPlatform] || PLATFORM_CONFIG['manual'] || { icon: '🔗', label: 'Meeting' };
  const isHRorAdmin = ['admin', 'hr'].includes(user?.role);
  const canCancel = isHRorAdmin && !['cancelled', 'completed'].includes(interview.status);
  const canReschedule = isHRorAdmin && !['cancelled', 'completed'].includes(interview.status);
  const canEdit = isHRorAdmin && !['cancelled', 'completed', 'rescheduled'].includes(interview.status);

  const openEdit = () => {
    const start = new Date(interview.scheduledAt);
    const local = new Date(start.getTime() - start.getTimezoneOffset() * 60000);
    reset({
      candidateName: interview.candidateName || '',
      candidateEmail: interview.candidateEmail,
      interviewerName: interview.interviewerName || '',
      interviewerEmail: interview.interviewerEmail,
      role: interview.role,
      interviewType: interview.interviewType,
      duration: String(interview.duration),
      scheduledAt: local.toISOString().slice(0, 16),
      timezone: interview.timezone || 'Asia/Kolkata',
      notes: interview.notes || '',
      meetingLink: interview.meetingLink || '',
    });
    setEditModal(true);
  };

  const onSaveEdit = async (form) => {
    setSavingEdit(true);
    try {
      const payload = {
        ...form,
        duration: parseInt(String(form.duration), 10),
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      };
      if (!payload.meetingLink?.trim()) delete payload.meetingLink;
      const { data } = await interviewsAPI.update(id, payload);
      setInterview(data.data.interview);
      setEditModal(false);
      toast.success('Interview updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update interview');
    } finally {
      setSavingEdit(false);
    }
  };

  const candidateInitials = interview.candidateName
    ? interview.candidateName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : interview.candidateEmail?.[0]?.toUpperCase() || 'C';
  const interviewerInitials = interview.interviewerName
    ? interview.interviewerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : interview.interviewerEmail?.[0]?.toUpperCase() || 'I';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(user?.role === 'hr' ? '/pipeline' : '/interviews')} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-slate-900 truncate">{interview.title || interview.role}</h1>
          <p className="text-sm text-slate-400">{interview.interviewType} interview</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={interview.status} />
          <InterviewTypeBadge type={interview.interviewType} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardContent>
              <h2 className="text-base font-bold text-slate-900 mb-4">Interview Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Calendar, label: 'Date', value: formatDate(interview.scheduledAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                  { icon: Clock, label: 'Time', value: `${new Date(interview.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} — ${new Date(interview.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` },
                  { icon: Clock, label: 'Duration', value: `${interview.duration} minutes` },
                  { icon: MapPin, label: 'Timezone', value: interview.timezone || 'UTC' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">{label}</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {interview.meetingLink && (
                <div className="mt-5 p-4 bg-brand-50 rounded-xl border border-brand-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{platform.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-brand-700">{platform.label}</p>
                        <p className="text-xs text-brand-500 truncate">{interview.meetingLink}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={copyLink} className="text-brand-600">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" onClick={() => window.open(interview.meetingLink, '_blank')}>
                        Join <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!interview.meetingLink && isHRorAdmin && (
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Paste meeting link
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={meetingLinkInput}
                      onChange={e => setMeetingLinkInput(e.target.value)}
                      placeholder="https://meet.google.com/... or any meeting URL"
                      className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <Button size="sm" icon={Save} loading={savingLink} onClick={saveMeetingLink}
                      disabled={!meetingLinkInput.trim()}>
                      Save
                    </Button>
                  </div>
                </div>
              )}

              {!interview.meetingLink && !isHRorAdmin && (
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-sm text-slate-500">Meeting link will be shared by HR soon.</p>
                </div>
              )}

              {interview.notes && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{interview.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        <div className="space-y-5">
          <Card>
            <CardContent>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Candidate</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {candidateInitials}
                </div>
                <div>
                  {interview.candidateName && <p className="text-sm font-bold text-slate-900">{interview.candidateName}</p>}
                  <p className="text-xs text-slate-400">{interview.candidateEmail}</p>
                </div>
              </div>
              {interview.candidateConfirmed && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed attendance
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Interviewer</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {interviewerInitials}
                </div>
                <div>
                  {interview.interviewerName && <p className="text-sm font-bold text-slate-900">{interview.interviewerName}</p>}
                  <p className="text-xs text-slate-400">{interview.interviewerEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</p>
              {interview.meetingLink && (
                <Button variant="secondary" className="w-full" size="sm" icon={ExternalLink}
                  onClick={() => window.open(interview.meetingLink, '_blank')}>
                  Join Meeting
                </Button>
              )}
              {canEdit && (
                <Button variant="secondary" className="w-full" size="sm" icon={Pencil} onClick={openEdit}>
                  Edit details
                </Button>
              )}
              {canReschedule && (
                <Button variant="secondary" className="w-full" size="sm" icon={RefreshCw}
                  onClick={() => setRescheduleModal(true)}>
                  Reschedule
                </Button>
              )}
              {canCancel && (
                <Button variant="danger" className="w-full" size="sm" icon={XCircle}
                  onClick={() => setCancelModal(true)}>
                  Cancel Interview
                </Button>
              )}
            </CardContent>
          </Card>

          {interview.scheduledBy && (
            <Card>
              <CardContent>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Scheduled By</p>
                <p className="text-sm font-medium text-slate-700">{interview.scheduledBy.firstName} {interview.scheduledBy.lastName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(interview.createdAt)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Interview" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel <strong>{interview.title}</strong> scheduled for{' '}
            <strong>{formatDateTime(interview.scheduledAt)}</strong>?
          </p>
          <Textarea label="Reason (required, min 10 characters)" rows={3} value={cancelReason}
            onChange={e => setCancelReason(e.target.value)} placeholder="Inform participants why this interview is cancelled..." />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCancelModal(false)}>Keep Interview</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleCancel}
              disabled={cancelReason.length < 10}>
              Cancel Interview
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit interview" size="md">
        <form onSubmit={handleSubmit(onSaveEdit)} className="p-1 space-y-3 max-h-[min(80vh,560px)] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input label="Candidate email" type="email" error={editErrors.candidateEmail?.message}
              {...register('candidateEmail', { required: 'Required' })} />
            <Input label="Candidate name" {...register('candidateName')} />
            <Input label="Interviewer email" type="email" error={editErrors.interviewerEmail?.message}
              {...register('interviewerEmail', { required: 'Required' })} />
            <Input label="Interviewer name" {...register('interviewerName')} />
            <Input label="Role" error={editErrors.role?.message} {...register('role', { required: true, minLength: 3 })} className="sm:col-span-2" />
            <Select label="Interview type" {...register('interviewType')}>
              {['screening', 'technical', 'behavioral', 'system-design', 'hr', 'final'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Input label="Duration (min)" type="number" error={editErrors.duration?.message}
              {...register('duration', { required: true, min: 15, max: 240, valueAsNumber: false })} />
            <Input label="Date & time" type="datetime-local" error={editErrors.scheduledAt?.message} className="sm:col-span-2"
              {...register('scheduledAt', { required: true })} />
            <Select label="Timezone" className="sm:col-span-2" {...register('timezone')}>
              <option value="Asia/Kolkata">India (IST) — Asia/Kolkata</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </Select>
            <Textarea className="sm:col-span-2" label="Notes" rows={2} {...register('notes')} />
            <Input label="Meeting link (optional)" className="sm:col-span-2" type="url" placeholder="https://..."
              {...register('meetingLink')} />
          </div>
          <p className="text-xs text-slate-500">Changing time may regenerate a Google Meet link if the interview uses that platform. Otherwise your stored link is kept until you change it here.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModal(false)}>Close</Button>
            <Button type="submit" loading={savingEdit} icon={Save}>Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={rescheduleModal} onClose={() => setRescheduleModal(false)} title="Reschedule Interview" size="sm">
        <div className="space-y-4">
          <Input label="New Date & Time" type="datetime-local" value={rescheduleDate}
            min={new Date().toISOString().slice(0, 16)}
            onChange={e => setRescheduleDate(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setRescheduleModal(false)}>Cancel</Button>
            <Button loading={actionLoading} onClick={handleReschedule} icon={RefreshCw}>Reschedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
