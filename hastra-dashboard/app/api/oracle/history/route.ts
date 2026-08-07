import { NextRequest, NextResponse } from 'next/server';

const ORACLE = '0xdF4ab20fA7752Be52E41e42F1FD667f37964d6a3';
const FEED_ID = '0x0007c8ed155d952e003b1e15ce7666fea785cfbe216577d578fce3920e997271';
// blastapi supports archive (historical) eth_call — no API key needed
const RPC = 'https://eth-mainnet.public.blastapi.io';
const PRICE_SEL = '0x2452ceb7';
const PADDED_FEED = FEED_ID.slice(2);

async function priceAtBlock(block: number): Promise<number> {
  const blockHex = '0x' + block.toString(16);
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: ORACLE, data: `${PRICE_SEL}${PADDED_FEED}` }, blockHex],
      id: block,
    }),
  });
  const json = await res.json();
  const result = json.result;
  if (!result || result === '0x' || json.error) return 0;
  return Number(BigInt(result)) / 1e18;
}

// Fill in zeros by interpolating between the nearest non-zero neighbours
function interpolateMissing(entries: [number, number][]): [number, number][] {
  const result = [...entries];
  for (let i = 0; i < result.length; i++) {
    if (result[i][1] !== 0) continue;
    // find previous and next valid prices
    let prevIdx = i - 1;
    while (prevIdx >= 0 && result[prevIdx][1] === 0) prevIdx--;
    let nextIdx = i + 1;
    while (nextIdx < result.length && result[nextIdx][1] === 0) nextIdx++;

    if (prevIdx >= 0 && nextIdx < result.length) {
      const [pb, pp] = result[prevIdx];
      const [nb, np] = result[nextIdx];
      const [b] = result[i];
      result[i][1] = pp + (np - pp) * ((b - pb) / (nb - pb));
    } else if (prevIdx >= 0) {
      result[i][1] = result[prevIdx][1];
    } else if (nextIdx < result.length) {
      result[i][1] = result[nextIdx][1];
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { blocks }: { blocks: number[] } = await req.json();
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return NextResponse.json({ prices: {} });
    }

    const unique = [...new Set(blocks)].sort((a, b) => a - b);

    // Batch in groups of 10 with a small gap to avoid rate limiting
    const BATCH = 10;
    const entries: [number, number][] = [];
    for (let i = 0; i < unique.length; i += BATCH) {
      const chunk = unique.slice(i, i + BATCH);
      const chunkResults = await Promise.all(
        chunk.map(async (block) => [block, await priceAtBlock(block)] as [number, number])
      );
      entries.push(...chunkResults);
      if (i + BATCH < unique.length) {
        await new Promise((r) => setTimeout(r, 150));
      }
    }

    const filled = interpolateMissing(entries);
    const prices: Record<number, number> = Object.fromEntries(filled);

    return NextResponse.json(
      { prices },
      { headers: { 'Cache-Control': 'public, max-age=3600, immutable' } }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
