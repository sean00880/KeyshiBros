const SOL_MINT = 'So11111111111111111111111111111111111111112';
const JUPITER_PRICE_URL = `https://api.jup.ag/price/v2?ids=${SOL_MINT}`;

export async function GET() {
  try {
    const res = await fetch(JUPITER_PRICE_URL, { next: { revalidate: 30 } });
    const data = await res.json();
    const solPrice = parseFloat(data?.data?.[SOL_MINT]?.price);

    if (!solPrice || isNaN(solPrice)) {
      return Response.json({ error: 'Failed to fetch SOL price' }, { status: 502 });
    }

    const presaleUsd = 9000;
    const solAmount = Math.ceil((presaleUsd / solPrice) * 1000) / 1000; // Round up to 3 decimals

    return Response.json({
      solPrice: Math.round(solPrice * 100) / 100,
      solAmount,
      presaleUsd,
      source: 'jupiter',
      timestamp: Date.now(),
    });
  } catch {
    return Response.json({ error: 'Price oracle unavailable' }, { status: 502 });
  }
}
