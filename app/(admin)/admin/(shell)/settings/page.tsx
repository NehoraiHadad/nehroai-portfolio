import { getDictionary } from '@/lib/i18n/dictionaries';
import { requireAdmin } from '@/lib/admin/auth';
import { getBrand } from '@/lib/admin/db/queries';
import { adminLang } from '../../../_components/lang';
import { PageHeader } from '../../../_components/PageHeader';
import { SettingsForm } from '../../../_components/SettingsForm';

export default async function SettingsPage() {
  const user = await requireAdmin();
  const lang = await adminLang();
  const dict = await getDictionary(lang);
  const brand = await getBrand(user.email, lang);
  const s = dict.admin.settings;
  return (
    <>
      <PageHeader title={s.title} subtitle={s.subtitle} />
      <div className="flex flex-col gap-6">
        <SettingsForm initialBrand={brand} />

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
