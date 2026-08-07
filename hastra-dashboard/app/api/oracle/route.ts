import { NextResponse } from 'next/server';

const ORACLE = '0xdF4ab20fA7752Be52E41e42F1FD667f37964d6a3';
const FEED_ID = '0x0007c8ed155d952e003b1e15ce7666fea785cfbe216577d578fce3920e997271';
const RPC = 'https://1rpc.io/eth';

// selector 0x2452ceb7 → price (uint256, 18 decimals)
// selector 0x76fa0b8a → last updated (uint256, unix timestamp)
const PRICE_SEL = '0x2452ceb7';
const TS_SEL = '0x76fa0b8a';
const PADDED_FEED = FEED_ID.slice(2); // strip 0x

async function ethCall(data: string): Promise<string> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: ORACLE, data }, 'latest'],
      id: 1,
    }),
    next: { revalidate: 60 }, // cache 60s
  });
  const json = await res.json();
  return json.result ?? '0x0';
}

export async function GET() {
  try {
    const [priceHex, tsHex] = await Promise.all([
      ethCall(`${PRICE_SEL}${PADDED_FEED}`),
      ethCall(`${TS_SEL}${PADDED_FEED}`),
    ]);

    const priceRaw = BigInt(priceHex);
    const lastUpdated = Number(BigInt(tsHex));
    // 18 decimal price → USD per wYLDS
    const usdPerWylds = Number(priceRaw) / 1e18;

    return NextResponse.json({
      usdPerWylds,
      lastUpdated,
      oracle: ORACLE,
      feedId: FEED_ID,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
