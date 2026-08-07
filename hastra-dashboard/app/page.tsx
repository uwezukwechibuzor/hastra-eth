'use client';

import { useQuery } from '@tanstack/react-query';
import { client, QUERIES, RawData } from '@/lib/graphql';
import { computeAnalytics } from '@/lib/analytics';
import { StatCard } from '@/components/StatCard';
import {
  TVLChart,
  FlowChart,
  FeesBarChart,
  EventPieChart,
  TopDepositorsChart,
} from '@/components/Charts';
import { ActivityFeed } from '@/components/ActivityFeed';
import { ContractInfo } from '@/components/ContractInfo';

type OracleData = { usdPerWylds: number; lastUpdated: number };
type HistoryData = { prices: Record<string, number> }; // block -> price

function fmtWylds(wylds: number): string {
  if (wylds >= 1_000_000) return `${(wylds / 1_000_000).toFixed(2)}M wYLDS`;
  if (wylds >= 1_000) return `${(wylds / 1_000).toFixed(1)}K wYLDS`;
  return `${wylds.toFixed(2)} wYLDS`;
}

function fmtUsd(usd: number): string {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<RawData>({
    queryKey: ['overview'],
    queryFn: () => client.request(QUERIES.overview),
    refetchInterval: 30_000,
  });

  const { data: oracle } = useQuery<OracleData>({
    queryKey: ['oracle'],
    queryFn: () => fetch('/api/oracle').then((r) => r.json()),
    refetchInterval: 60_000,
    staleTime: 60_000,
  });

  const todayPrice = oracle?.usdPerWylds ?? 0;

  // Once we have the indexed data, extract one block per day and fetch historical oracle prices
  const analytics = data ? computeAnalytics(data) : null;

  const allDayBlocks = analytics
    ? [
        ...analytics.feesTimeSeries.map((d) => d.block),
        ...analytics.flowTimeSeries.map((d) => d.block),
        ...analytics.tvlTimeSeries.map((d) => d.block),
      ]
    : [];

  const { data: historyData } = useQuery<HistoryData>({
    queryKey: ['oracle-history', allDayBlocks.slice(0, 3).join(',')],
    queryFn: () =>
      fetch('/api/oracle/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: [...new Set(allDayBlocks)] }),
      }).then((r) => r.json()),
    enabled: allDayBlocks.length > 0,
    staleTime: 3_600_000, // historical prices don't change
  });

  // Build a block->price lookup (fall back to today's price for any missing)
  const priceByBlock: Record<number, number> = {};
  if (historyData?.prices) {
    for (const [block, price] of Object.entries(historyData.prices)) {
      priceByBlock[Number(block)] = price > 0 ? price : todayPrice;
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
          <span style={{ color: '#64748b' }}>Loading vault analytics…</span>
        </div>
      </div>
    );
  }

  if (error || !data || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center flex flex-col gap-3">
          <span className="text-2xl">⚠️</span>
          <p style={{ color: '#ef4444' }}>Failed to load data. Is the Envio indexer running?</p>
          <code className="text-xs px-3 py-1 rounded" style={{ background: '#1e2535', color: '#94a3b8' }}>
            pnpm dev (in hastra-eth-indexer)
          </code>
        </div>
      </div>
    );
  }

  const a = analytics;
  const tvlWylds = a.tvl / 1_000_000;
  const depositWylds = a.totalDepositAssets / 1_000_000;
  const withdrawWylds = a.totalWithdrawAssets / 1_000_000;
  const feesWylds = a.totalRewards / 1_000_000;

  // Current TVL in USD uses today's live oracle price (correct — TVL is current)
  const hasPrice = todayPrice > 0;
  const hasPriceHistory = Object.keys(priceByBlock).length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--card-border)', background: 'var(--card)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            H
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: '#e2e8f0' }}>Hastra Vault Analytics</h1>
            <p className="text-xs" style={{ color: '#64748b' }}>0x19ebb…F7F6 · Ethereum Mainnet · ERC4626</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasPrice && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#1e2535' }}>
              <span className="text-xs font-mono font-semibold" style={{ color: '#10b981' }}>
                1 wYLDS = ${todayPrice.toFixed(6)}
              </span>
              <span className="text-xs" style={{ color: '#475569' }}>NAV Oracle</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs" style={{ color: '#64748b' }}>Live · {a.depositCount + a.withdrawalCount + a.feeCount} events</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">

        {/* KPI row 1 — current snapshot: use today's price */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="col-span-2">
            <StatCard
              title="Total Value Locked"
              value={hasPrice ? fmtUsd(tvlWylds * todayPrice) : fmtWylds(tvlWylds)}
              subtitle={`${fmtWylds(tvlWylds)} · ${a.depositCount} deposits`}
              accent="#6366f1" icon="🏦"
            />
          </div>
          <div className="col-span-2">
            <StatCard
              title="Total Deposited"
              value={hasPrice ? fmtUsd(depositWylds * todayPrice) : fmtWylds(depositWylds)}
              subtitle={`${fmtWylds(depositWylds)} · ${a.uniqueDepositors} depositors`}
              accent="#10b981" icon="↓"
            />
          </div>
          <div className="col-span-2">
            <StatCard
              title="Total Withdrawn"
              value={hasPrice ? fmtUsd(withdrawWylds * todayPrice) : fmtWylds(withdrawWylds)}
              subtitle={`${fmtWylds(withdrawWylds)} · ${a.uniqueWithdrawers} withdrawers`}
              accent="#ef4444" icon="↑"
            />
          </div>
          <div className="col-span-2">
            <StatCard
              title="Fees Generated"
              value={hasPrice ? fmtUsd(feesWylds * todayPrice) : fmtWylds(feesWylds)}
              subtitle={`${fmtWylds(feesWylds)} · ${a.feeCount} events`}
              accent="#f59e0b" icon="✦"
            />
          </div>
        </div>

        {/* KPI row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="col-span-2">
            <StatCard
              title="wYLDS Price (NAV)"
              value={hasPrice ? `$${todayPrice.toFixed(6)}` : 'Loading…'}
              subtitle="live on-chain NAV oracle"
              accent="#10b981" icon="◈"
            />
          </div>
          <div className="col-span-2">
            <StatCard title="Avg Share Price" value={`${a.avgDepositRatio.toFixed(4)} wYLDS`} subtitle="assets per share at deposit" accent="#8b5cf6" icon="◈" />
          </div>
          <div className="col-span-2">
            <StatCard title="Transfers" value={String(a.transferCount)} subtitle={`${a.mintCount} mints · ${a.burnCount} burns`} accent="#06b6d4" icon="⇄" />
          </div>
          <div className="col-span-2">
            <StatCard title="Roles Granted" value={String(a.rolesGranted.length)} subtitle={`${a.rolesRevoked.length} revoked`} accent="#ec4899" icon="🔑" />
          </div>
        </div>

        {/* TVL + Flow — use historical prices per day */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TVLChart data={a.tvlTimeSeries} priceByBlock={hasPriceHistory ? priceByBlock : undefined} />
          <FlowChart data={a.flowTimeSeries} priceByBlock={hasPriceHistory ? priceByBlock : undefined} />
        </div>

        {/* Fees bar chart — full width, historical prices */}
        <div className="grid grid-cols-1 gap-5">
          <FeesBarChart data={a.feesTimeSeries} priceByBlock={hasPriceHistory ? priceByBlock : undefined} />
        </div>

        {/* Event pie + top depositors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <EventPieChart data={a.eventCounts} />
          <TopDepositorsChart data={a.topDepositors} price={todayPrice} />
        </div>

        {/* Activity + Contract info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ActivityFeed items={a.recentActivity} price={todayPrice} />
          <ContractInfo analytics={a} price={todayPrice} />
        </div>

      </div>
    </div>
  );
}
