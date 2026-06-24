// Shared admin page header (server-safe — no client hooks). Title + optional
// subtitle + optional right-aligned action slot.
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 no-print">
      <div>
        <h1 className="!mb-1 text-[var(--t-30)]">{title}</h1>
        {subtitle && <p className="text-sm text-fg-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
