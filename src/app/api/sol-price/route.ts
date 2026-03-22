/**
 * SOL/USD Price API — CoinGecko Simple Price (free, no key, 10 req/min)
 *
 * Cached for 1 hour server-side via Next.js revalidate.
 * Client fetches once on page load — no polling needed.
 */

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';
const PRESALE_USD = 4500;

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      // Fallback to Jupiter if CoinGecko is down
      return await jupiterFallback();
    }

    const data = await res.json();
    const solPrice = data?.solana?.usd;

    if (!solPrice || typeof solPrice !== 'number') {
      return await jupiterFallback();
    }

    const solAmount = Math.ceil((PRESALE_USD / solPrice) * 1000) / 1000;

    return Response.json({
      solPrice: Math.round(solPrice * 100) / 100,
      solAmount,
      presaleUsd: PRESALE_USD,
      source: 'coingecko',
      timestamp: Date.now(),
    });
  } catch {
    return await jupiterFallback();
  }
}

async function jupiterFallback(): Promise<Response> {
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

    const solAmount = Math.ceil((PRESALE_USD / solPrice) * 1000) / 1000;

    return Response.json({
      solPrice: Math.round(solPrice * 100) / 100,
      solAmount,
      presaleUsd: PRESALE_USD,
      source: 'jupiter-fallback',
      timestamp: Date.now(),
    });
  } catch {
    return Response.json({ error: 'All price oracles unavailable' }, { status: 502 });
  }
}
