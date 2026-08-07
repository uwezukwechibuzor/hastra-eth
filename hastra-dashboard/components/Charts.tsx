'use client';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';

const CARD_STYLE = {
  background: 'var(--card)',
  borderColor: 'var(--card-border)',
};

function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5 flex flex-col gap-4" style={CARD_STYLE}>
      <h3 className="text-sm font-semibold tracking-wide" style={{ color: '#94a3b8' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#1e2535',
  border: '1px solid #2e3a52',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
};

type PBB = Record<number, number>;

export function TVLChart({ data, priceByBlock }: { data: { day: string; tvl: number; block: number }[]; priceByBlock?: PBB }) {
  const showUsd = !!priceByBlock && Object.keys(priceByBlock).length > 0;
  // Pre-compute USD TVL per day using the correct historical price for that block
  const plotData = data.map((d) => ({
    ...d,
    tvlUsd: showUsd ? d.tvl * (priceByBlock![d.block] ?? 0) : d.tvl,
  }));
  const maxVal = Math.max(...plotData.map((d) => showUsd ? d.tvlUsd : d.tvl));
  const fmt = (v: number) => maxVal >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0);
  return (
    <ChartWrapper title={`Cumulative TVL${showUsd ? ' (USD · historical price)' : ' (wYLDS)'}`}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={plotData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => showUsd ? `$${fmt(v)}` : `${fmt(v)}`} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: unknown) => {
              const n = Number(v);
              return showUsd
                ? [`$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'TVL (USD)']
                : [`${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} wYLDS`, 'TVL'];
            }}
          />
          <Area type="monotone" dataKey={showUsd ? 'tvlUsd' : 'tvl'} stroke="#6366f1" strokeWidth={2} fill="url(#tvlGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function FlowChart({ data, priceByBlock }: { data: { day: string; deposits: number; withdrawals: number; block: number }[]; priceByBlock?: PBB }) {
  const showUsd = !!priceByBlock && Object.keys(priceByBlock).length > 0;
  const plotData = data.map((d) => {
    const p = priceByBlock?.[d.block] ?? 0;
    return {
      ...d,
      depositsUsd: d.deposits * p,
      withdrawalsUsd: d.withdrawals * p,
    };
  });
  const maxVal = Math.max(...plotData.map((d) => showUsd ? Math.max(d.depositsUsd, d.withdrawalsUsd) : Math.max(d.deposits, d.withdrawals)));
  const fmt = (v: number) => {
    const prefix = showUsd ? '$' : '';
    return maxVal >= 1000 ? `${prefix}${(v / 1000).toFixed(0)}K` : `${prefix}${v.toFixed(0)}`;
  };
  return (
    <ChartWrapper title={`Daily Deposits vs Withdrawals${showUsd ? ' (USD · historical price)' : ' (wYLDS)'}`}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={plotData} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={fmt} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: unknown) => {
              const n = Number(v);
              return showUsd
                ? [`$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, '']
                : [`${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} wYLDS`, ''];
            }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          <Bar dataKey={showUsd ? 'depositsUsd' : 'deposits'} name="Deposits" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey={showUsd ? 'withdrawalsUsd' : 'withdrawals'} name="Withdrawals" fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function RewardsChart({ data }: { data: { day: string; amount: number }[] }) {
  return (
    <ChartWrapper title="Daily Rewards Distributed (wYLDS)">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={(v) => `$${v.toFixed(4)}`}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v).toFixed(6)} wYLDS`, 'Fees']} />
          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

const PIE_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'];

export function EventPieChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ChartWrapper title="Event Type Distribution">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function TopDepositorsChart({ data, price = 0 }: { data: { addr: string; assets: number }[]; price?: number }) {
  const showUsd = price > 0;
  const fmt = (v: number) => showUsd
    ? `$${(v * price / 1000).toFixed(0)}K`
    : `${(v / 1000).toFixed(0)}K`;
  return (
    <ChartWrapper title={`Top Depositors by Volume${showUsd ? ' (USD)' : ' (wYLDS)'}`}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={fmt} />
          <YAxis dataKey="addr" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: unknown) => {
              const n = Number(v);
              return showUsd
                ? [`$${(n * price).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Volume']
                : [`${n.toLocaleString('en-US', { maximumFractionDigits: 0 })} wYLDS`, 'Volume'];
            }}
          />
          <Bar dataKey="assets" name="Total Deposited" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function SharePriceChart({ data }: { data: { day: string; tvl: number }[] }) {
  return (
    <ChartWrapper title="Vault Growth (TVL Trend)">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })} wYLDS`, 'TVL']} />
          <Area type="monotone" dataKey="tvl" stroke="#10b981" strokeWidth={2} fill="url(#growthGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

type FeeDay = { day: string; fees: number; cumulative: number; count: number; block: number };

// How many bars to show in the initial window before the user scrolls
const BRUSH_WINDOW = 20;

export function FeesBarChart({ data, priceByBlock }: { data: FeeDay[]; priceByBlock?: PBB }) {
  const showUsd = !!priceByBlock && Object.keys(priceByBlock).length > 0;

  // Pre-compute per-day USD values using the historical price for that block
  const plotData = data.map((d) => {
    const p = priceByBlock?.[d.block] ?? 0;
    return { ...d, feesUsd: d.fees * p, cumulativeUsd: d.cumulative * p };
  });

  const maxFee = showUsd
    ? Math.max(...plotData.map((d) => d.feesUsd))
    : Math.max(...data.map((d) => d.fees));

  const tickFmt = (v: number) => showUsd
    ? (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toFixed(0)}`)
    : (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v.toFixed(0)}`);
  const cumFmt = (v: number) => showUsd
    ? (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(2)}`)
    : (v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v.toFixed(2)}`);

  // Start the brush window on the most recent days
  const brushStart = Math.max(0, data.length - BRUSH_WINDOW);

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4 col-span-full"
      style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: '#94a3b8' }}>
            Daily Fees Generated {showUsd ? '(USD · historical price)' : '(wYLDS)'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
            <code>RewardsDistributed</code> events · {data.length} days total · drag the range bar to scroll
          </p>
        </div>
        <div className="flex gap-4 text-xs" style={{ color: '#64748b' }}>
          <span>
            <span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: '#f59e0b' }} />
            Daily Fees
          </span>
          <span>
            <span className="inline-block w-3 h-0.5 mr-1 align-middle" style={{ background: '#06b6d4' }} />
            Cumulative
          </span>
        </div>
      </div>

      {/* Chart — extra bottom margin so the Brush sits below the axis */}
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart data={plotData} margin={{ top: 8, right: 64, bottom: 8, left: 8 }}>
          <defs>
            <linearGradient id="feeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.65} />
            </linearGradient>
            {/* minimap bar fill used inside the Brush */}
            <linearGradient id="brushFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#d97706" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />

          <XAxis
            dataKey="day"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#1e2535' }}
            interval="preserveStartEnd"
          />

          {/* Left axis: daily fees */}
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickFormatter={tickFmt}
            axisLine={false}
            tickLine={false}
            width={56}
          />

          {/* Right axis: cumulative */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#06b6d4', fontSize: 11 }}
            tickFormatter={cumFmt}
            axisLine={false}
            tickLine={false}
            width={64}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            formatter={(value: unknown, name: unknown) => {
              const v = Number(value);
              const label = String(name);
              const display = showUsd
                ? `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : `${v.toLocaleString('en-US', { maximumFractionDigits: 4 })} wYLDS`;
              return [display, label];
            }}
            labelStyle={{ color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}
          />

          <Bar
            yAxisId="left"
            dataKey={showUsd ? 'feesUsd' : 'fees'}
            name="Daily Fees"
            fill="url(#feeBarGrad)"
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey={showUsd ? 'cumulativeUsd' : 'cumulative'}
            name="Cumulative"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
          />

          {/* ── DeFiLlama-style range brush ── */}
          <Brush
            dataKey="day"
            startIndex={brushStart}
            endIndex={data.length - 1}
            height={36}
            travellerWidth={8}
            stroke="#2e3a52"
            fill="#0d0f14"
            traveller={<BrushHandle />}
          >
            {/* tiny bar sparkline shown inside the brush track */}
            <BarChart>
              <Bar dataKey={showUsd ? 'feesUsd' : 'fees'} fill="url(#brushFill)" isAnimationActive={false} />
            </BarChart>
          </Brush>
        </ComposedChart>
      </ResponsiveContainer>

      {/* Summary strip */}
      <div
        className="grid grid-cols-3 gap-3 pt-3 border-t text-center"
        style={{ borderColor: '#1e2535' }}
      >
        <div>
          <div className="text-xs" style={{ color: '#64748b' }}>Peak Day</div>
          <div className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            {showUsd
              ? plotData.reduce((m, d) => (d.feesUsd > m.feesUsd ? d : m), plotData[0])?.day ?? '—'
              : data.reduce((m, d) => (d.fees > m.fees ? d : m), data[0])?.day ?? '—'}
          </div>
          <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>
            {showUsd
              ? `$${maxFee.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
              : `${maxFee.toLocaleString('en-US', { maximumFractionDigits: 2 })} wYLDS`}
          </div>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#64748b' }}>Avg Daily</div>
          <div className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
            {(() => {
              const avg = showUsd
                ? plotData.reduce((s, d) => s + d.feesUsd, 0) / plotData.length
                : data.reduce((s, d) => s + d.fees, 0) / data.length;
              return showUsd
                ? `$${avg.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : `${avg.toLocaleString('en-US', { maximumFractionDigits: 2 })} wYLDS`;
            })()}
          </div>
          <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>over {data.length} days</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: '#64748b' }}>Total Fees</div>
          <div className="text-sm font-semibold" style={{ color: '#06b6d4' }}>
            {(() => {
              // Sum day-by-day using each day's historical price (not the last cumulative * today's price)
              const total = showUsd
                ? plotData.reduce((s, d) => s + d.feesUsd, 0)
                : (data[data.length - 1]?.cumulative ?? 0);
              return showUsd
                ? `$${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
                : `${total.toLocaleString('en-US', { maximumFractionDigits: 2 })} wYLDS`;
            })()}
          </div>
          <div className="text-xs font-mono" style={{ color: '#94a3b8' }}>{data.reduce((s, d) => s + d.count, 0)} events</div>
        </div>
      </div>
    </div>
  );
}

// Custom traveller handle — the two vertical drag handles on the brush
function BrushHandle(props: Record<string, unknown>) {
  const { x, y, height } = props as { x: number; y: number; height: number };
  return (
    <g>
      <rect
        x={x - 4}
        y={y}
        width={8}
        height={height}
        rx={3}
        fill="#6366f1"
        stroke="#0d0f14"
        strokeWidth={1}
      />
      {/* two grip lines */}
      <line x1={x} y1={y + height * 0.35} x2={x} y2={y + height * 0.65} stroke="#fff" strokeWidth={1.5} strokeOpacity={0.6} />
      <line x1={x} y1={y + height * 0.4} x2={x} y2={y + height * 0.6} stroke="#fff" strokeWidth={1} strokeOpacity={0.3} />
    </g>
  );
}
