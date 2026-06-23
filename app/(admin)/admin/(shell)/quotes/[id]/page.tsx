import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../../_components/lang';
import { PageHeader } from '../../../../_components/PageHeader';

// FOUNDATION PLACEHOLDER — Chip #2 (builder/edit) and Chip #3 (branded preview)
// replace this with the edit + preview view for a single quote. `params` is a
// Promise in Next 16 — await it.
export default async function QuoteDetailPage({ params }: PageProps<'/admin/quotes/[id]'>) {
  await requireAdmin();
  const { id } = await params;
  const dict = await getDictionary(await adminLang());
  return (
    <>
      <PageHeader title={dict.admin.builder.editTitle} subtitle={id} />
      <div className="card p-10 text-center text-sm text-fg-2">{dict.admin.preview.title}</div>
    </>
  );
}
