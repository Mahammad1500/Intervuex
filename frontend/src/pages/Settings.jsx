import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, Save, Building2, Copy, Link2, Users, RefreshCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { usersAPI, companiesAPI, api } from '../services/api';
import { formatDateTime } from '../lib/utils';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';
import { cn } from '../lib/utils';

const makeTabs = (includeWorkspace) => {
  const base = [
    { id: 'profile', label: 'Profile', icon: User },
    ...(includeWorkspace
      ? [{ id: 'workspace', label: 'Workspace', icon: Building2 }]
      : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];
  return base;
};

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const includeWorkspace = ['hr', 'admin'].includes(user?.role);
  const TABS = makeTabs(includeWorkspace);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'profile');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [wsLoading, setWsLoading] = useState(false);
  const [copied, setCopied] = useState('');
  const [notif, setNotif] = useState({ email: true, emailCopyToOrganizer: true, reminder24h: true, reminder1h: true, reminder15: false });
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    const p = user?.preferences?.notifications;
    if (p) {
      setNotif({
        email: p.email !== false,
        emailCopyToOrganizer: p.emailCopyToOrganizer !== false,
        reminder24h: p.reminder24h !== false,
        reminder1h: p.reminder1h !== false,
        reminder15: p.reminder15 === true,
      });
    }
  }, [user?._id, user?.preferences?.notifications]);

  const setTab = (id) => {
    setActiveTab(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id === 'profile') next.delete('tab');
      else next.set('tab', id);
      return next;
    });
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone || '',
      department: user?.department || '',
      jobTitle: user?.jobTitle || '',
      'preferences.timezone': user?.preferences?.timezone || 'Asia/Kolkata',
    }
  });

  const { register: registerPw, handleSubmit: handleSubmitPw, formState: { errors: pwErrors }, reset: resetPw, watch } = useForm();
  const newPassword = watch('newPassword');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab) return;
    if (makeTabs(includeWorkspace).some((t) => t.id === tab)) setActiveTab(tab);
  }, [searchParams, includeWorkspace]);

  const loadWorkspace = useCallback(() => {
    if (!includeWorkspace) return;
    setWsLoading(true);
    companiesAPI
      .getWorkspace()
      .then(({ data }) => setWorkspace(data.data))
      .catch(() => setWorkspace(null))
      .finally(() => setWsLoading(false));
  }, [includeWorkspace]);

  useEffect(() => {
    if (includeWorkspace && activeTab === 'workspace') loadWorkspace();
  }, [activeTab, includeWorkspace, loadWorkspace]);

  const copyToClipboard = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Could not copy');
    }
  };

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await usersAPI.update(user._id, data);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const onChangePassword = async (data) => {
    setSavingPassword(true);
    try {
      await api.patch('/auth/update-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setSavingPassword(false); }
  };

  const persistNotif = async (key, value) => {
    if (!user?._id) return;
    setNotif((prev) => ({ ...prev, [key]: value }));
    setSavingNotif(true);
    try {
      const next = { ...user.preferences?.notifications, [key]: value };
      const res = await usersAPI.update(user._id, { preferences: { notifications: next } });
      updateUser(res.data.data.user);
    } catch {
      toast.error('Could not save');
      setNotif((prev) => ({ ...prev, [key]: !value }));
    } finally {
      setSavingNotif(false);
    }
  };

  const wCompany = workspace?.hasWorkspace && workspace?.company ? workspace.company : null;
  const regUrl = wCompany
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?code=${wCompany.spaceCode}`
    : '';
  const inviteBlurb = wCompany
    ? `Join our team on Intervuex — our workspace code is ${wCompany.spaceCode}. Register here: ${regUrl}`
    : '';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your profile, integrations, and preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-52 flex-shrink-0 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === id
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              )}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0 space-y-5">
          {activeTab === 'workspace' && includeWorkspace && (
            <motion.div key="workspace" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-gradient-to-br from-violet-50 to-brand-50 rounded-2xl border border-violet-100/80 shadow-soft p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Company workspace</h2>
                    <p className="text-sm text-slate-600 mt-1 max-w-lg">
                      Share your <span className="font-semibold text-slate-800">Space code</span> with HR colleagues so they can join this workspace on the registration page. The code is tied to your company in Intervuex.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" type="button" icon={RefreshCw} onClick={loadWorkspace} loading={wsLoading}>
                    Refresh
                  </Button>
                </div>
              </div>

              {wsLoading && (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 animate-pulse h-48" />
              )}

              {!wsLoading && workspace && !workspace.hasWorkspace && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <p className="text-sm font-medium text-amber-900">{workspace.message}</p>
                  {user?.role === 'admin' && (
                    <p className="text-xs text-amber-800/90 mt-2">Create a company from the admin dashboard, then link HR users to it.</p>
                  )}
                </div>
              )}

              {!wsLoading && wCompany && (
                <>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Company</h3>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{wCompany.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Workspace created {new Date(wCompany.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Space code</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <code className="flex-1 text-2xl sm:text-3xl font-black tracking-[0.25em] text-slate-900 bg-slate-100 px-4 py-3 rounded-xl text-center sm:text-left">
                        {wCompany.spaceCode}
                      </code>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={Copy}
                          onClick={() => copyToClipboard('code', wCompany.spaceCode)}
                        >
                          {copied === 'code' ? 'Copied' : 'Copy code'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Users className="w-4 h-4" />
                        Active HR in workspace
                      </div>
                      <p className="text-3xl font-black text-slate-900">{workspace?.stats?.activeHRCount ?? 0}</p>
                      <p className="text-xs text-slate-400 mt-1">Colleagues with the HR role in your company</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-5">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                        <Link2 className="w-4 h-4" />
                        Ready-to-share link
                      </div>
                      <p className="text-xs text-slate-500 break-all leading-relaxed mb-3 font-mono">{regUrl}</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-full sm:w-auto"
                        icon={Copy}
                        onClick={() => copyToClipboard('url', regUrl)}
                      >
                        {copied === 'url' ? 'Copied' : 'Copy invite link'}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message template</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{inviteBlurb}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-3"
                      icon={Copy}
                      onClick={() => copyToClipboard('blurb', inviteBlurb)}
                    >
                      {copied === 'blurb' ? 'Copied' : 'Copy full message'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Personal Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-black">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      user?.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      'bg-violet-100 text-violet-700'
                    }`}>{user?.role}</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="First Name" error={errors.firstName?.message}
                      {...register('firstName', { required: 'Required' })} />
                    <Input label="Last Name" error={errors.lastName?.message}
                      {...register('lastName', { required: 'Required' })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Phone" placeholder="+1 555 000 0000" {...register('phone')} />
                    <Input label="Department" placeholder="Engineering" {...register('department')} />
                  </div>
                  <Input label="Job Title" placeholder="Senior Engineer" {...register('jobTitle')} />
                  <Select label="Timezone" {...register('preferences.timezone')}>
                    <option value="Asia/Kolkata">India (IST) — Asia/Kolkata</option>
                    {['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
                      'Europe/London', 'Europe/Paris', 'Asia/Tokyo',
                      'Asia/Singapore', 'Australia/Sydney'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </Select>
                  <div className="flex justify-end">
                    <Button type="submit" loading={saving} icon={Save}>Save Changes</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                <h2 className="text-base font-bold text-slate-900 mb-1">Email & reminders</h2>
                <p className="text-sm text-slate-500 mb-5">Saves to your account. In-app alerts in the top bar are unchanged.</p>
                <div className="space-y-1">
                  {[
                    { key: 'email', label: 'System emails (SMTP)', desc: 'If off, you won’t get organizer copy emails; candidate/interviewer may still be emailed by workflow.' },
                    { key: 'emailCopyToOrganizer', label: 'Copy of “interview scheduled” to me', desc: 'A short summary when you (or your team) schedule a round.' },
                    { key: 'reminder24h', label: 'Send 24h automated reminders', desc: 'To candidate and interviewer, one day before the slot.' },
                    { key: 'reminder1h', label: 'Send 1h automated reminders' },
                    { key: 'reminder15', label: 'Send 15-minute reminders', desc: 'Optional; many teams leave this off to reduce noise.' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3.5 border-b border-slate-50 last:border-0 gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
                      </div>
                      <button
                        type="button"
                        disabled={savingNotif}
                        role="switch"
                        aria-checked={notif[key]}
                        onClick={() => persistNotif(key, !notif[key])}
                        className={`relative w-11 h-6 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${notif[key] ? 'bg-brand-500' : 'bg-slate-200'}`}
                      >
                        <span
                          className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform', notif[key] ? 'left-6' : 'left-1')}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                <h2 className="text-base font-bold text-slate-900 mb-5">Change Password</h2>
                <form onSubmit={handleSubmitPw(onChangePassword)} className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="Your current password"
                    error={pwErrors.currentPassword?.message}
                    {...registerPw('currentPassword', { required: 'Current password required' })} />
                  <Input label="New Password" type="password" placeholder="Min 8 chars, uppercase & number"
                    error={pwErrors.newPassword?.message}
                    {...registerPw('newPassword', {
                      required: 'New password required',
                      minLength: { value: 8, message: 'At least 8 characters' },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase, number' }
                    })} />
                  <Input label="Confirm New Password" type="password" placeholder="Repeat new password"
                    error={pwErrors.confirmPassword?.message}
                    {...registerPw('confirmPassword', {
                      required: 'Please confirm password',
                      validate: v => v === newPassword || 'Passwords do not match'
                    })} />
                  <div className="flex justify-end">
                    <Button type="submit" loading={savingPassword} icon={Shield}>Update Password</Button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
                <h2 className="text-base font-bold text-slate-900 mb-3">Active Sessions</h2>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Current Session</p>
                      <p className="text-xs text-slate-400 mt-0.5">Web Browser · {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
