import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'amber' | 'navy';
};

const toneStyles: Record<NonNullable<StatCardProps['tone']>, string> = {
  blue: 'bg-blue-50 text-brand-blue ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  navy: 'bg-slate-100 text-brand-navy ring-slate-200',
};

export function StatCard({ icon: Icon, label, tone = 'blue', value }: StatCardProps) {
  return (
    <div className="elevated-card rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold text-brand-navy">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-lg ring-1 ring-inset ${toneStyles[tone]}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
