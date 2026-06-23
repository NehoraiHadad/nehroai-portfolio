import { requireAdmin } from '@/lib/admin/auth';
import { AdminShell } from '../../_components/AdminShell';

// Protected shell: authoritative auth + allowlist check happens here (and is
// re-checked in each page/action). Everything rendered inside is admin-only.
export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <AdminShell user={user}>{children}</AdminShell>;
}
