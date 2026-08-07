import { RawData, toWYLDS, formatAddress, formatRole, blockToApproxDate } from './graphql';

export function computeAnalytics(data: RawData) {
  const totalDepositAssets = data.deposits.reduce((s, d) => s + Number(d.assets), 0);
  const totalWithdrawAssets = data.withdrawals.reduce((s, w) => s + Number(w.assets), 0);
  const tvl = totalDepositAssets - totalWithdrawAssets;
  const totalRewards = data.rewards.reduce((s, r) => s + Number(r.amount), 0);

  const uniqueDepositors = new Set(data.deposits.map((d) => d.owner)).size;
  const uniqueWithdrawers = new Set(data.withdrawals.map((w) => w.owner)).size;

  const mints = data.transfers.filter((t) => t.from === '0x0000000000000000000000000000000000000000');
  const burns = data.transfers.filter((t) => t.to === '0x0000000000000000000000000000000000000000');
  const regularTransfers = data.transfers.filter(
    (t) =>
      t.from !== '0x0000000000000000000000000000000000000000' &&
      t.to !== '0x0000000000000000000000000000000000000000'
  );

  // Deposit volume by depositor
  const depositsByAddress: Record<string, number> = {};
  for (const d of data.deposits) {
    depositsByAddress[d.owner] = (depositsByAddress[d.owner] ?? 0) + Number(d.assets);
  }
  const topDepositors = Object.entries(depositsByAddress)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([addr, assets]) => ({ addr: formatAddress(addr), fullAddr: addr, assets: toWYLDS(assets) }));

  // Fees generated over time (group by day using on-chain timestamp)
  // Store the first block of each day so we can fetch the oracle price at that block
  const feesByDay: Record<string, { total: number; count: number; date: Date; block: number }> = {};
  for (const r of data.rewards) {
    const dt = new Date(Number(r.timestamp) * 1000);
    const day = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const block = parseInt(r.id.split('_')[1]);
    if (!feesByDay[day]) feesByDay[day] = { total: 0, count: 0, date: dt, block };
    else feesByDay[day].block = Math.min(feesByDay[day].block, block); // first block of day
    feesByDay[day].total += Number(r.amount);
    feesByDay[day].count += 1;
  }
  const sortedFeeDays = Object.entries(feesByDay).sort(
    (a, b) => a[1].date.getTime() - b[1].date.getTime()
  );
  let cumFees = 0;
  const feesTimeSeries = sortedFeeDays.map(([day, v]) => {
    cumFees += toWYLDS(v.total);
    return {
      day,
      fees: toWYLDS(v.total),
      cumulative: Math.round(cumFees * 100) / 100,
      count: v.count,
      block: v.block,
    };
  });
  const rewardsTimeSeries = feesTimeSeries.map((f) => ({ day: f.day, amount: f.fees }));

  // Deposits vs withdrawals over time (group by approx date from block)
  const flowByDay: Record<string, { deposits: number; withdrawals: number; block: number }> = {};
  for (const d of data.deposits) {
    const day = blockToApproxDate(d.id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const block = parseInt(d.id.split('_')[1]);
    if (!flowByDay[day]) flowByDay[day] = { deposits: 0, withdrawals: 0, block };
    else flowByDay[day].block = Math.min(flowByDay[day].block, block);
    flowByDay[day].deposits += toWYLDS(d.assets);
  }
  for (const w of data.withdrawals) {
    const day = blockToApproxDate(w.id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const block = parseInt(w.id.split('_')[1]);
    if (!flowByDay[day]) flowByDay[day] = { deposits: 0, withdrawals: 0, block };
    else flowByDay[day].block = Math.min(flowByDay[day].block, block);
    flowByDay[day].withdrawals += toWYLDS(w.assets);
  }
  const flowTimeSeries = Object.entries(flowByDay)
    .sort((a, b) => new Date(a[0] + ' 2026').getTime() - new Date(b[0] + ' 2026').getTime())
    .map(([day, v]) => ({ day, deposits: v.deposits, withdrawals: v.withdrawals, block: v.block }));

  // Event distribution pie
  const eventCounts = [
    { name: 'Deposits', value: data.deposits.length, color: '#6366f1' },
    { name: 'Withdrawals', value: data.withdrawals.length, color: '#ef4444' },
    { name: 'Transfers', value: regularTransfers.length, color: '#f59e0b' },
    { name: 'Mints', value: mints.length, color: '#10b981' },
    { name: 'Burns', value: burns.length, color: '#8b5cf6' },
    { name: 'Fees', value: data.rewards.length, color: '#06b6d4' },
    { name: 'Roles', value: data.rolesGranted.length + data.rolesRevoked.length, color: '#ec4899' },
  ].filter((e) => e.value > 0);

  // Role distribution
  const roleCounts: Record<string, number> = {};
  for (const r of data.rolesGranted) {
    const name = formatRole(r.role);
    roleCounts[name] = (roleCounts[name] ?? 0) + 1;
  }
  const roleDistribution = Object.entries(roleCounts).map(([name, count]) => ({ name, count }));

  // Cumulative TVL over time
  const allFlowEvents = [
    ...data.deposits.map((d) => ({
      ts: blockToApproxDate(d.id).getTime(),
      block: parseInt(d.id.split('_')[1]),
      delta: toWYLDS(d.assets),
    })),
    ...data.withdrawals.map((w) => ({
      ts: blockToApproxDate(w.id).getTime(),
      block: parseInt(w.id.split('_')[1]),
      delta: -toWYLDS(w.assets),
    })),
  ].sort((a, b) => a.ts - b.ts);

  let running = 0;
  const tvlTimeSeries: { day: string; tvl: number; block: number }[] = [];
  const seen = new Set<string>();
  for (const ev of allFlowEvents) {
    running += ev.delta;
    const day = new Date(ev.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!seen.has(day)) {
      seen.add(day);
      tvlTimeSeries.push({ day, tvl: Math.max(0, running), block: ev.block });
    } else {
      const last = tvlTimeSeries[tvlTimeSeries.length - 1];
      last.tvl = Math.max(0, running);
      last.block = Math.min(last.block, ev.block); // first block of day
    }
  }

  // Withdrawal vs Deposit share ratio (assets per share)
  const avgDepositRatio =
    data.deposits.length > 0
      ? data.deposits.reduce((s, d) => s + Number(d.assets) / Number(d.shares), 0) / data.deposits.length
      : 1;

  // Recent events for activity feed
  const recentDeposits = [...data.deposits]
    .sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1]))
    .slice(0, 10)
    .map((d) => ({
      type: 'Deposit',
      addr: formatAddress(d.sender),
      amount: toWYLDS(d.assets).toLocaleString('en-US', { maximumFractionDigits: 2 }),
      block: d.id.split('_')[1],
      color: '#6366f1',
    }));

  const recentWithdrawals = [...data.withdrawals]
    .sort((a, b) => parseInt(b.id.split('_')[1]) - parseInt(a.id.split('_')[1]))
    .slice(0, 10)
    .map((w) => ({
      type: 'Withdraw',
      addr: formatAddress(w.sender),
      amount: toWYLDS(w.assets).toLocaleString('en-US', { maximumFractionDigits: 2 }),
      block: w.id.split('_')[1],
      color: '#ef4444',
    }));

  const recentActivity = [...recentDeposits, ...recentWithdrawals]
    .sort((a, b) => parseInt(b.block) - parseInt(a.block))
    .slice(0, 12);

  return {
    tvl,
    totalDepositAssets,
    totalWithdrawAssets,
    totalRewards,
    uniqueDepositors,
    uniqueWithdrawers,
    depositCount: data.deposits.length,
    withdrawalCount: data.withdrawals.length,
    transferCount: regularTransfers.length,
    mintCount: mints.length,
    burnCount: burns.length,
    feeCount: data.rewards.length,
    frozenCount: data.frozenAccounts.length,
    rolesGranted: data.rolesGranted,
    rolesRevoked: data.rolesRevoked,
    topDepositors,
    feesTimeSeries,
    rewardsTimeSeries,
    flowTimeSeries,
    eventCounts,
    roleDistribution,
    tvlTimeSeries,
    avgDepositRatio,
    recentActivity,
    upgradeCount: data.upgrades.length,
    latestImpl: data.upgrades[data.upgrades.length - 1]?.implementation ?? 'N/A',
    navOracle: data.navOracleUpdates[data.navOracleUpdates.length - 1]?.newOracle ?? 'N/A',
  };
}

export type Analytics = ReturnType<typeof computeAnalytics>;
