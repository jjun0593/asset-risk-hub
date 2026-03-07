import type { AssetClass } from "./types";

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  crypto: "Crypto",
  us: "US Market",
  kr: "Korea Market",
  metals: "Metals",
  fx: "FX",
};

export const DEFAULT_ASSET_CLASS: AssetClass = "crypto";

export const DEFAULT_SYMBOL_BY_ASSET_CLASS: Record<AssetClass, string> = {
  crypto: "BTCUSDT",
  us: "QQQ",
  kr: "KOSPI",
  metals: "XAUUSD",
  fx: "USDKRW",
};
