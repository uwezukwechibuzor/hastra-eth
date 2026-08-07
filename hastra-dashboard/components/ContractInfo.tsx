'use client';

import { Analytics } from '@/lib/analytics';
import { formatAddress } from '@/lib/graphql';

export function ContractInfo({ analytics, price = 0 }: { analytics: Analytics; price?: number }) {
  const rows = [
    { label: 'Contract Address', value: '0x19ebb35279A16207Ec4ba82799CC64715065F7F6', mono: true },
    { label: 'Underlying Token', value: 'wYLDS (Hastra wYLDS)', mono: false },
    { label: 'wYLDS Price (NAV)', value: price > 0 ? `$${price.toFixed(6)}` : 'loading…', mono: false },
    { label: 'Network', value: 'Ethereum Mainnet (Chain 1)', mono: false },
    { label: 'Contract Type', value: 'ERC4626 Yield Vault (ERC1967 Proxy)', mono: false },
    { label: 'Latest Implementation', value: analytics.latestImpl !== 'N/A' ? formatAddress(analytics.latestImpl) : 'N/A', mono: true },
    { label: 'Contract Upgrades', value: String(analytics.upgradeCount), mono: false },
    { label: 'NAV Oracle', value: analytics.navOracle !== 'N/A' ? formatAddress(analytics.navOracle) : 'N/A', mono: true },
    { label: 'Fee Events', value: String(analytics.feeCount), mono: false },
    { label: 'Frozen Accounts', value: String(analytics.frozenCount), mono: false },
    { label: 'Total Events Indexed', value: '18,368', mono: false },
  ];

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: '#94a3b8' }}>
        Contract Info
      </h3>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: '#1e2535' }}>
            <span className="text-xs" style={{ color: '#64748b' }}>{row.label}</span>
            <span
              className={`text-xs font-${row.mono ? 'mono' : 'medium'}`}
              style={{ color: '#e2e8f0' }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
