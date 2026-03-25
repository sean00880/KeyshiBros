/**
 * SOL/USD Price API — CoinGecko Simple Price (free, no key, 10 req/min)
 *
 * Accepts ?product=main|test to calculate SOL amount for different products.
 * Cached for 1 hour server-side via Next.js revalidate.
 */

import { PRODUCTS, type ProductId } from '@/lib/presale-products';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = (searchParams.get('product') || 'main') as ProductId;
  const product = PRODUCTS[productId] || PRODUCTS.main;
  const presaleUsd = product.usdAmount;

  try {
    const res = await fetch(COINGECKO_URL, {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) return await jupiterFallback(presaleUsd);

    const data = await res.json();
    const solPrice = data?.solana?.usd;

    if (!solPrice || typeof solPrice !== 'number') return await jupiterFallback(presaleUsd);

    const solAmount = Math.ceil((presaleUsd / solPrice) * 1000) / 1000;

    return Response.json({
      solPrice: Math.round(solPrice * 100) / 100,
      solAmount,
      presaleUsd,
      productId,
      tokenAllocation: product.tokenAllocation,
      source: 'coingecko',
      timestamp: Date.now(),
    });
  } catch {
    return await jupiterFallback(presaleUsd);
  }
}

async function jupiterFallback(presaleUsd: number): Promise<Response> {
  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const res = await fetch(`https://api.jup.ag/price/v2?ids=${SOL_MINT}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    const solPrice = parseFloat(data?.data?.[SOL_MINT]?.price);

    if (!solPrice || isNaN(solPrice)) {
      return Response.json({ error: 'Price unavailable' }, { status: 502 });
    }

    const solAmount = Math.ceil((presaleUsd / solPrice) * 1000) / 1000;

    return Response.json({
      solPrice: Math.round(solPrice * 100) / 100,
      solAmount,
      presaleUsd,
      source: 'jupiter-fallback',
      timestamp: Date.now(),
    });
  } catch {
    return Response.json({ error: 'All price oracles unavailable' }, { status: 502 });
  }
}
