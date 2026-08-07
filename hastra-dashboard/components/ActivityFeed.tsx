'use client';

interface ActivityItem {
  type: string;
  addr: string;
  amount: string; // raw wYLDS number as string
  block: string;
  color: string;
}

export function ActivityFeed({ items, price = 0 }: { items: ActivityItem[]; price?: number }) {
  const showUsd = price > 0;

  function fmtAmount(raw: string) {
    const n = parseFloat(raw.replace(/,/g, ''));
    if (showUsd) {
      const usd = n * price;
      if (usd >= 1000) return `$${(usd / 1000).toFixed(1)}K`;
      return `$${usd.toFixed(2)}`;
    }
    return `${raw} wYLDS`;
  }

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: '#94a3b8' }}>
        Recent Activity
      </h3>
      <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#1e2535' }}>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: `${item.color}22`, color: item.color }}
              >
                {item.type}
              </span>
              <span className="text-sm font-mono" style={{ color: '#94a3b8' }}>
                {item.addr}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold" style={{ color: item.color }}>
                {fmtAmount(item.amount)}
              </span>
              <span className="text-xs font-mono" style={{ color: '#475569' }}>
                #{item.block}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
