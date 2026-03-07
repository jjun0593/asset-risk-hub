import {
  CHART_INTERVALS,
  assetRegistry,
  isAssetSymbol,
} from "@/features/assets";
import type { AssetSymbol, ChartInterval } from "@/features/assets";

import { fetchBinanceKlines } from "./fetchBinanceKlines";
import type { KlinesResult } from "./types";

const VALID_INTERVALS = new Set<ChartInterval>(CHART_INTERVALS);

function parseLimit(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 1000);
}

function isChartInterval(value: string): value is ChartInterval {
  return VALID_INTERVALS.has(value as ChartInterval);
}

export function parseKlinesRequest(params: URLSearchParams): {
  symbol: AssetSymbol;
  interval: ChartInterval;
  limit: number;
} {
  const symbolParam = params.get("symbol");
  const intervalParam = params.get("interval");
  const limit = parseLimit(params.get("limit"));

  const symbol: AssetSymbol =
    symbolParam && isAssetSymbol(symbolParam) ? symbolParam : "BTCUSDT";

  const interval: ChartInterval =
    intervalParam && isChartInterval(intervalParam) ? intervalParam : "5m";

  return { symbol, interval, limit };
}

export async function getKlines(input: {
  symbol: AssetSymbol;
  interval: ChartInterval;
  limit: number;
}): Promise<KlinesResult> {
  const { symbol, interval, limit } = input;

  const asset = assetRegistry[symbol];

  if (!asset) {
    return {
      candles: [],
      meta: {
        symbol,
        interval,
        provider: "internal",
        supported: false,
        reason: `Unknown symbol: ${symbol}`,
      },
    };
  }

  if (asset.marketDataProvider === "binance") {
    const candles = await fetchBinanceKlines({
      symbol,
      interval,
      limit,
    });

    return {
      candles,
      meta: {
        symbol,
        interval,
        provider: asset.marketDataProvider,
        supported: true,
      },
    };
  }

  return {
    candles: [],
    meta: {
      symbol,
      interval,
      provider: asset.marketDataProvider,
      supported: false,
      reason: `Market data provider not implemented yet for asset class: ${asset.assetClass}`,
    },
  };
}
