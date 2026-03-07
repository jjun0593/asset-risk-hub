import { NextRequest, NextResponse } from "next/server";

const BINANCE_BASE_URL = "https://api.binance.com";

type BinanceKlineRow = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

type KlineResponseItem = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const ALLOWED_INTERVALS = new Set(["1m", "3m", "5m", "15m", "1h", "4h", "1d"]);

const ALLOWED_SYMBOLS = new Set([
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "SUIUSDT",
]);

function parseLimit(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 1000);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const symbol = searchParams.get("symbol") ?? "BTCUSDT";
    const interval = searchParams.get("interval") ?? "5m";
    const limit = parseLimit(searchParams.get("limit"));

    if (!ALLOWED_SYMBOLS.has(symbol)) {
      return NextResponse.json(
        { error: `Unsupported symbol: ${symbol}` },
        { status: 400 },
      );
    }

    if (!ALLOWED_INTERVALS.has(interval)) {
      return NextResponse.json(
        { error: `Unsupported interval: ${interval}` },
        { status: 400 },
      );
    }

    const url = new URL("/api/v3/klines", BINANCE_BASE_URL);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Failed to fetch Binance klines",
          details: errorText,
        },
        { status: response.status },
      );
    }

    const raw = (await response.json()) as BinanceKlineRow[];

    const candles: KlineResponseItem[] = raw.map((row) => ({
      time: Math.floor(row[0] / 1000),
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
    }));

    return NextResponse.json({ candles });
  } catch (error) {
    console.error("Klines API route error:", error);

    return NextResponse.json(
      { error: "Internal server error while loading klines" },
      { status: 500 },
    );
  }
}
