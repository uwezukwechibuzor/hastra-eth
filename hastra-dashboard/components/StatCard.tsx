'use client';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
  icon?: string;
}

export function StatCard({ title, value, subtitle, accent = '#6366f1', icon }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-2 border"
      style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--muted)' }}>
          {title}
        </span>
        {icon && (
          <span
            className="text-lg w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: `${accent}22`, color: accent }}
          >
            {icon}
          </span>
        )}
      </div>
      <span className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
        {value}
      </span>
      {subtitle && <span className="text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</span>}
    </div>
  );
}
