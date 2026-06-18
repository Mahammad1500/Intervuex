import { Building2 } from 'lucide-react';
import WorkspacePanel from '../components/admin/WorkspacePanel';

export default function Workspaces() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-black text-slate-900">Company workspaces</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Create a workspace for each company you support. Each gets an 8-character <strong>Space code</strong>.
          HR registers at <code className="text-xs bg-slate-100 px-1 rounded">/register?code=XXXXXXXX</code> or you add them from Team.
        </p>
      </div>
      <WorkspacePanel />
    </div>
  );
}
