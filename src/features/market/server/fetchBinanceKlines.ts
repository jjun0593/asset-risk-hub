import type { AssetSymbol, ChartInterval } from "@/features/assets";
import type { KlineResponseItem } from "./types";

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

export async function fetchBinanceKlines(params: {
  symbol: AssetSymbol;
  interval: ChartInterval;
  limit: number;
}): Promise<KlineResponseItem[]> {
  const { symbol, interval, limit } = params;

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

    throw new Error(
      `Failed to fetch Binance klines (${response.status}): ${errorText}`,
    );
  }

  const raw = (await response.json()) as BinanceKlineRow[];

  return raw.map((row) => ({
    time: Math.floor(row[0] / 1000),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
  }));
}
