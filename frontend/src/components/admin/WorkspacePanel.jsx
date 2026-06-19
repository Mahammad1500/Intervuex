import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Copy, Pencil, Plus, Trash2, Link2, KeyRound } from 'lucide-react';
import { companiesAPI } from '../../services/api';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { toast } from '../ui/Toaster';
import { formatDate } from '../../lib/utils';

export default function WorkspacePanel({ onCountChange }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editCompany, setEditCompany] = useState(null);
  const [savingCode, setSavingCode] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: '', spaceCode: '', allowedEmailDomains: '' },
  });
  const { register: regCode, handleSubmit: submitCode, formState: { errors: errCode }, reset: resetCode } = useForm({
    defaultValues: { spaceCode: '' },
  });
  const { register: regCo, handleSubmit: submitCo, formState: { errors: errCo }, reset: resetCo } = useForm({
    defaultValues: { name: '', allowedEmailDomains: '' },
  });

  const fetchCompanies = useCallback(() => {
    setLoading(true);
    companiesAPI
      .getAll({ limit: 100, page: 1 })
      .then((res) => {
        const list = res.data.data?.companies || [];
        setCompanies(list);
        onCountChange?.(res.data.data?.pagination?.total ?? list.length);
      })
      .catch(() => toast.error('Could not load workspaces'))
      .finally(() => setLoading(false));
  }, [onCountChange]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    if (editTarget?.spaceCode) resetCode({ spaceCode: editTarget.spaceCode });
  }, [editTarget, resetCode]);

  useEffect(() => {
    if (editCompany) {
      resetCo({
        name: editCompany.name || '',
        allowedEmailDomains: (editCompany.allowedEmailDomains || []).join(', '),
      });
    }
  }, [editCompany, resetCo]);

  const onFormValidationError = (formErrors) => {
    const first = Object.values(formErrors)[0];
    if (first?.message) toast.error(first.message);
  };

  const onCreateCompany = async (form) => {
    setCreating(true);
    try {
      const payload = { name: form.name?.trim() };
      const raw = form.spaceCode?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (raw && raw.length === 8) payload.spaceCode = raw;
      if (raw && raw.length > 0 && raw.length !== 8) {
        toast.error('Space code must be 8 characters, or leave blank to auto-generate.');
        setCreating(false);
        return;
      }
      if (form.allowedEmailDomains?.trim()) payload.allowedEmailDomains = form.allowedEmailDomains;
      await companiesAPI.create(payload);
      toast.success('Company workspace created');
      setCreateModal(false);
      reset();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create workspace');
    } finally {
      setCreating(false);
    }
  };

  const onUpdateSpaceCode = async (form) => {
    if (!editTarget) return;
    const raw = form.spaceCode?.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (raw.length !== 8) {
      toast.error('Space code must be exactly 8 letters or numbers.');
      return;
    }
    setSavingCode(true);
    try {
      await companiesAPI.updateSpaceCode(editTarget._id, raw);
      toast.success('Space code updated');
      setEditTarget(null);
      resetCode();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingCode(false);
    }
  };

  const onUpdateCompany = async (form) => {
    if (!editCompany) return;
    setSavingCompany(true);
    try {
      await companiesAPI.update(editCompany._id, {
        name: form.name?.trim(),
        allowedEmailDomains: form.allowedEmailDomains || '',
      });
      toast.success('Workspace updated');
      setEditCompany(null);
      resetCo();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingCompany(false);
    }
  };

  const onDeleteCompany = async (company) => {
    if (!window.confirm(`Delete "${company.name}"? HR users in this workspace will be deactivated.`)) return;
    setDeletingId(company._id);
    try {
      await companiesAPI.delete(company._id);
      toast.success('Workspace deleted');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete workspace');
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Space code copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const copyRegisterLink = async (code) => {
    const url = `${window.location.origin}/register?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('HR registration link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const formatDomains = (domains) => {
    if (!domains?.length) return 'Any email domain';
    return domains.map((d) => `@${d}`).join(', ');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden card-3d">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Company workspaces</h2>
            <p className="text-sm text-slate-500 mt-0.5">Each workspace gets a Space code so HR can join the right company</p>
          </div>
          <Button size="sm" icon={Plus} onClick={() => { reset(); setCreateModal(true); }}>
            Create workspace
          </Button>
        </div>
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm animate-pulse">Loading workspaces…</div>
          ) : companies.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-500 text-sm">No company workspaces yet.</p>
              <Button className="mt-4" size="sm" icon={Plus} onClick={() => { reset(); setCreateModal(true); }}>
                Create your first workspace
              </Button>
            </div>
          ) : (
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Space code</th>
                  <th className="px-5 py-3">Allowed emails</th>
                  <th className="px-5 py-3">Active HR</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">Since {c.createdAt ? formatDate(c.createdAt) : '—'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="text-sm font-mono font-bold tracking-widest text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                        {c.spaceCode}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 max-w-[200px]">{formatDomains(c.allowedEmailDomains)}</td>
                    <td className="px-5 py-3.5 text-slate-700">{c.hrCount ?? 0}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" type="button" icon={Copy} onClick={() => copyCode(c.spaceCode)} title="Copy space code" />
                        <Button variant="ghost" size="sm" type="button" icon={Link2} onClick={() => copyRegisterLink(c.spaceCode)} title="Copy HR register link" />
                        <Button variant="ghost" size="sm" type="button" icon={Pencil} onClick={() => setEditCompany(c)} title="Edit name & domains" />
                        <Button variant="ghost" size="sm" type="button" icon={KeyRound} onClick={() => setEditTarget(c)} title="Change space code" />
                        <Button variant="ghost" size="sm" type="button" icon={Trash2} loading={deletingId === c._id} onClick={() => onDeleteCompany(c)} title="Delete" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={createModal} onClose={() => { setCreateModal(false); reset(); }}
        title="Create company workspace"
        description="A workspace is one company on Intervuex. HR uses the Space code to register or you add them from Team."
        size="md"
      >
        <form onSubmit={handleSubmit(onCreateCompany, onFormValidationError)} className="p-6 pt-2 space-y-4">
          <Input label="Company name" placeholder="e.g. Acme Corp" error={errors.name?.message}
            hint="At least 2 characters"
            {...register('name', {
              required: 'Company name is required',
              minLength: { value: 2, message: 'Company name must be at least 2 characters' },
              validate: (v) => (v?.trim().length >= 2) || 'Company name must be at least 2 characters',
            })} />
          <Input label="Custom Space code (optional)" placeholder="8 letters/numbers, or leave blank"
            error={errors.spaceCode?.message}
            hint="Leave blank to auto-generate, or enter exactly 8 characters"
            {...register('spaceCode', {
              validate: (v) => {
                if (!v || !String(v).trim()) return true;
                const t = String(v).replace(/[^A-Za-z0-9]/g, '');
                return t.length === 0 || t.length === 8 || 'Space code must be 8 characters or left blank';
              },
            })} />
          <Textarea label="Allowed email domains (optional)" rows={2}
            placeholder="company.com, company.co.in — HR emails must match"
            hint="Leave blank to allow any email domain"
            {...register('allowedEmailDomains')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setCreateModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={creating}>Create workspace</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editCompany} onClose={() => { setEditCompany(null); resetCo(); }}
        title="Edit workspace" size="md">
        {editCompany && (
          <form onSubmit={submitCo(onUpdateCompany, onFormValidationError)} className="p-6 pt-2 space-y-4">
            <Input label="Company name" error={errCo.name?.message}
              {...regCo('name', {
                required: 'Company name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
              })} />
            <Textarea label="Allowed email domains" rows={2} {...regCo('allowedEmailDomains')} />
            <p className="text-xs text-slate-500">Space code: <code className="font-mono font-bold">{editCompany.spaceCode}</code></p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => { setEditCompany(null); resetCo(); }}>Cancel</Button>
              <Button type="submit" loading={savingCompany}>Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); resetCode(); }}
        title="Change Space code" size="sm">
        {editTarget && (
          <form onSubmit={submitCode(onUpdateSpaceCode, onFormValidationError)} className="p-6 pt-2 space-y-4">
            <p className="text-sm text-slate-600">Company: <strong>{editTarget.name}</strong></p>
            <Input label="New Space code (8 characters)" error={errCode.spaceCode?.message}
              {...regCode('spaceCode', {
                required: 'Required',
                validate: (v) => String(v || '').replace(/[^A-Za-z0-9]/g, '').length === 8 || 'Use 8 letters/numbers',
              })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => { setEditTarget(null); resetCode(); }}>Cancel</Button>
              <Button type="submit" loading={savingCode}>Save</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
