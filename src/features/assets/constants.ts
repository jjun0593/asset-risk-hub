import type { AssetClass, AssetSymbol, ChartInterval } from "./types";

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  crypto: "Crypto",
  us: "US Market",
  kr: "Korea Market",
  metals: "Metals",
  fx: "FX",
};

export const DEFAULT_ASSET_CLASS: AssetClass = "crypto";

export const DEFAULT_SYMBOL_BY_ASSET_CLASS: Record<AssetClass, AssetSymbol> = {
  crypto: "BTCUSDT",
  us: "QQQ",
  kr: "KOSPI",
  metals: "XAUUSD",
  fx: "USDKRW",
};

export const INTERVALS_BY_ASSET_CLASS: Record<AssetClass, ChartInterval[]> = {
  crypto: ["1m", "3m", "5m", "15m", "1h", "4h", "1d"],
  us: ["5m", "15m", "1h", "4h", "1d"],
  kr: ["5m", "15m", "1h", "4h", "1d"],
  metals: ["5m", "15m", "1h", "4h", "1d"],
  fx: ["5m", "15m", "1h", "4h", "1d"],
};

export const DEFAULT_INTERVAL_BY_ASSET_CLASS: Record<
  AssetClass,
  ChartInterval
> = {
  crypto: "1h",
  us: "1h",
  kr: "1h",
  metals: "1h",
  fx: "1h",
};
