import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';
import { SettingsForm } from '../../../_components/SettingsForm';

export default async function SettingsPage() {
  const user = await requireAdmin();
  const dict = await getDictionary(await adminLang());
  const s = dict.admin.settings;
  return (
    <>
      <PageHeader title={s.title} subtitle={s.subtitle} />
      <div className="flex flex-col gap-6">
        <SettingsForm email={user.email} />

        {/* Future scope — see plans/admin and FUTURE.md */}
        <div className="card p-5">
          <h2 className="!mb-3 text-[var(--t-20)]">{s.comingSoon}</h2>
          <ul className="flex flex-wrap gap-2">
            {s.comingSoonItems.map((item) => (
              <li key={item} className="chip">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
