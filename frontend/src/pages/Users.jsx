import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, ToggleLeft, ToggleRight, Building2, UsersRound, Pencil, Mail, Copy, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usersAPI, companiesAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import { RoleBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';
import { formatDate, formatApiError } from '../lib/utils';

export default function Users() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [tempPasswordModal, setTempPasswordModal] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const createRole = watch('role');
  const editRole = watch('editRole');

  const {
    register: regEdit, handleSubmit: submitEdit, reset: resetEdit, watch: watchEdit, formState: { errors: editErrors },
  } = useForm();

  useEffect(() => {
    companiesAPI
      .getAll({ limit: 200 })
      .then((r) => setCompanies(r.data.data?.companies || []))
      .catch((err) => {
        setCompanies([]);
        if (err.response?.status && err.response.status !== 401) {
          toast.error(formatApiError(err, 'Could not load company list'));
        }
      });
  }, []);

  const companyName = useMemo(() => {
    const m = {};
    companies.forEach((c) => { m[String(c._id)] = c.name; });
    return m;
  }, [companies]);

  const companyById = useMemo(() => {
    const m = {};
    companies.forEach((c) => { m[String(c._id)] = c; });
    return m;
  }, [companies]);

  const grouped = useMemo(() => {
    const g = { _unassigned: [] };
    users.forEach((u) => {
      const raw = u.companyId?._id ?? u.companyId;
      const k = raw ? String(raw) : '_unassigned';
      if (!g[k]) g[k] = [];
      g[k].push(u);
    });
    const order = Object.keys(g).sort((a, b) => {
      if (a === '_unassigned') return 1;
      if (b === '_unassigned') return -1;
      return (companyName[a] || a).localeCompare(companyName[b] || b);
    });
    const ordered = {};
    order.forEach((k) => { ordered[k] = g[k]; });
    return ordered;
  }, [users, companyName]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      const { data } = await usersAPI.getAll(params);
      setUsers(data.data?.users ?? []);
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to load users'));
    } finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const domainHint = (companyId) => {
    const c = companyById[String(companyId)];
    if (!c?.allowedEmailDomains?.length) return 'Any email domain allowed for this workspace.';
    return `Email must be @${c.allowedEmailDomains.join(' or @')}`;
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await usersAPI.toggleStatus(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)));
      toast.success(isActive ? 'User deactivated' : 'User activated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const onCreateUser = async (data) => {
    setCreating(true);
    try {
      const payload = { ...data };
      if (payload.role !== 'hr') delete payload.companyId;
      const { data: res } = await usersAPI.create(payload);
      setUsers((prev) => [res.data.user, ...prev]);
      setCreateModal(false);
      reset();
      if (res.data.tempPassword) {
        setTempPasswordModal({
          email: res.data.user.email,
          tempPassword: res.data.tempPassword,
        });
        toast.success('User created', 'Copy the temporary password if email did not arrive.');
      } else {
        toast.success('User created', 'Welcome email sent with a temporary password.');
      }
    } catch (err) {
      toast.error(formatApiError(err, 'Failed to create user'));
    } finally { setCreating(false); }
  };

  const handleResendWelcome = async (userId) => {
    setResendingId(userId);
    try {
      const { data } = await usersAPI.resendWelcome(userId);
      setTempPasswordModal({
        email: users.find((u) => u._id === userId)?.email,
        tempPassword: data.data.tempPassword,
        resent: true,
      });
      toast.success('Welcome email sent again');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend email');
    } finally {
      setResendingId(null);
    }
  };

  const copyTempPassword = async (pw) => {
    try {
      await navigator.clipboard.writeText(pw);
      toast.success('Password copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleDeleteUser = async (urow) => {
    if (urow._id === currentUser?._id) {
      toast.error('You cannot delete your own account.');
      return;
    }
    const label = `${urow.firstName} ${urow.lastName} (${urow.email})`;
    if (!window.confirm(`Permanently delete ${label}? This cannot be undone.`)) return;
    setDeletingId(urow._id);
    try {
      await usersAPI.delete(urow._id);
      setUsers((prev) => prev.filter((u) => u._id !== urow._id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (urow) => {
    setEditUser(urow);
    const cid = urow.companyId?._id ?? urow.companyId;
    resetEdit({
      firstName: urow.firstName,
      lastName: urow.lastName,
      department: urow.department || '',
      jobTitle: urow.jobTitle || '',
      role: urow.role,
      companyId: cid ? String(cid) : '',
    });
    setEditModal(true);
  };

  const onEditUser = async (data) => {
    if (!editUser) return;
    setSaving(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        jobTitle: data.jobTitle,
        role: data.role,
      };
      if (data.role === 'hr') payload.companyId = data.companyId;
      const { data: res } = await usersAPI.update(editUser._id, payload);
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? res.data.user : u)));
      toast.success('User updated');
      setEditModal(false);
      setEditUser(null);
      resetEdit();
    } catch (err) {
      toast.error(formatApiError(err, 'Update failed'));
    } finally { setSaving(false); }
  };

  const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Team</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage admins and HR per company workspace</p>
        </div>
        <Button icon={UserPlus} onClick={() => { reset(); setCreateModal(true); }}>Add user</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { role: 'admin', label: 'Admins', color: 'bg-rose-50 border-rose-100', text: 'text-rose-700' },
          { role: 'hr', label: 'HR', color: 'bg-violet-50 border-violet-100', text: 'text-violet-700' },
        ].map(({ role, label, color, text }) => (
          <motion.div key={role}
            className={`p-4 rounded-2xl border ${color} cursor-pointer card-3d`}
            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
          >
            <p className="text-2xl font-black text-slate-900">{roleCounts[role] || 0}</p>
            <p className={`text-sm font-semibold mt-1 ${text}`}>{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 card-3d">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Search by name or email..." value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white cursor-pointer"
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          {users.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-10">No users found</div>
          ) : Object.entries(grouped).map(([cid, groupUsers]) => (
            <div key={cid} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                {cid === '_unassigned' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full pl-2 pr-3 py-1">
                    <UsersRound className="w-4 h-4" />
                    No workspace — assign HR from Edit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full pl-2 pr-3 py-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {companyName[cid] || 'Company'}
                    <span className="text-emerald-600/80 font-mono text-[10px] ml-1">
                      {companies.find((c) => String(c._id) === String(cid))?.spaceCode}
                    </span>
                  </span>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden card-3d">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {['User', 'Role', 'Department', 'Joined', 'Status', 'Actions'].map((h) => (
                        <th key={h} className={`text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupUsers.map((urow, i) => (
                      <motion.tr key={urow._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {urow.firstName?.[0]}{urow.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{urow.firstName} {urow.lastName}</p>
                              <p className="text-xs text-slate-400">{urow.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><RoleBadge role={urow.role} /></td>
                        <td className="px-5 py-4 text-sm text-slate-500">{urow.department || '—'}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{formatDate(urow.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            urow.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${urow.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {urow.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-0.5">
                            <button type="button" onClick={() => handleResendWelcome(urow._id)} disabled={resendingId === urow._id || !urow.isActive}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-600 disabled:opacity-40" title="Resend welcome email">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => openEdit(urow)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => handleToggleStatus(urow._id, urow.isActive)}
                              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                              title={urow.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {urow.isActive ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button type="button" onClick={() => handleDeleteUser(urow)}
                              disabled={deletingId === urow._id || urow._id === currentUser?._id}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 disabled:opacity-40"
                              title={urow._id === currentUser?._id ? 'Cannot delete yourself' : 'Delete permanently'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createModal} onClose={() => { setCreateModal(false); reset(); }}
        title="Add team member" description="Creates an account and emails a temporary password.">
        <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
          </div>
          <Input label="Email" type="email" error={errors.email?.message}
            {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
          <Select label="Role" error={errors.role?.message} {...register('role', { required: 'Required' })}>
            <option value="">Select role...</option>
            <option value="admin">Platform admin</option>
            <option value="hr">HR</option>
          </Select>
          {createRole === 'hr' && (
            <>
              <Select label="Company workspace" error={errors.companyId?.message}
                {...register('companyId', { required: 'HR must belong to a company' })}>
                <option value="">Select company...</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} · {c.spaceCode}</option>
                ))}
              </Select>
              {watch('companyId') && (
                <p className="text-xs text-slate-500 -mt-2">{domainHint(watch('companyId'))}</p>
              )}
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" {...register('department')} />
            <Input label="Job title" {...register('jobTitle')} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => { setCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={creating} icon={UserPlus}>Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={editModal} onClose={() => { setEditModal(false); setEditUser(null); resetEdit(); }}
        title="Edit team member" description={editUser ? editUser.email : ''}>
        <form onSubmit={submitEdit(onEditUser)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" error={editErrors.firstName?.message} {...regEdit('firstName', { required: 'Required' })} />
            <Input label="Last name" error={editErrors.lastName?.message} {...regEdit('lastName', { required: 'Required' })} />
          </div>
          <Select label="Role" {...regEdit('role', { required: true })}>
            <option value="admin">Platform admin</option>
            <option value="hr">HR</option>
          </Select>
          {watchEdit('role') === 'hr' && (
            <>
              <Select label="Company workspace" error={editErrors.companyId?.message}
                {...regEdit('companyId', { required: 'Required for HR' })}>
                <option value="">Select company...</option>
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} · {c.spaceCode}</option>
                ))}
              </Select>
              {watchEdit('companyId') && (
                <p className="text-xs text-slate-500 -mt-2">{domainHint(watchEdit('companyId'))}</p>
              )}
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Department" {...regEdit('department')} />
            <Input label="Job title" {...regEdit('jobTitle')} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => { setEditModal(false); resetEdit(); }}>Cancel</Button>
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!tempPasswordModal} onClose={() => setTempPasswordModal(null)}
        title={tempPasswordModal?.resent ? 'New temporary password' : 'User created — save this password'}
        description="Shown once for your records. Also sent by email if SMTP is configured. User can keep this password — change is optional in Settings."
        size="sm"
      >
        {tempPasswordModal && (
          <div className="p-6 pt-2 space-y-4">
            <p className="text-sm text-slate-600">Account: <strong>{tempPasswordModal.email}</strong></p>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-3">
              <code className="flex-1 text-sm font-mono font-bold break-all">{tempPasswordModal.tempPassword}</code>
              <Button type="button" size="sm" variant="secondary" icon={Copy} onClick={() => copyTempPassword(tempPasswordModal.tempPassword)}>Copy</Button>
            </div>
            <Button className="w-full" onClick={() => setTempPasswordModal(null)}>Done</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
