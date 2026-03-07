export const ASSET_CLASSES = ["crypto", "us", "kr", "metals", "fx"] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number];

export const CHART_INTERVALS = [
  "1m",
  "3m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
] as const;

export type ChartInterval = (typeof CHART_INTERVALS)[number];

export const ASSET_SYMBOLS = [
  // Crypto
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "SUIUSDT",

  // US
  "QQQ",
  "SPY",
  "NVDA",
  "AAPL",
  "MSFT",

  // KR
  "KOSPI",
  "KOSDAQ",
  "005930",
  "000660",

  // Metals
  "XAUUSD",
  "XAGUSD",

  // FX
  "USDKRW",
  "AUDUSD",
  "USDAUD",
  "USDJPY",
] as const;

export type AssetSymbol = (typeof ASSET_SYMBOLS)[number];

export type MarketDataProvider =
  | "binance"
  | "yahoo"
  | "stooq"
  | "alphaVantage"
  | "manual"
  | "internal";

export type AssetMetadata = {
  symbol: AssetSymbol;
  label: string;
  assetClass: AssetClass;

  /**
   * Human-readable group label for future UI display.
   * Example: "Crypto", "US Market", "Korea", "Metals", "FX"
   */
  groupLabel: string;

  /**
   * Optional display / data-fetch routing hints.
   * This lets us add class-specific fetchers later without changing selector logic.
   */
  marketDataProvider: MarketDataProvider;

  /**
   * Future-friendly alias for external provider mapping.
   * Example:
   * - Binance symbol: BTCUSDT
   * - Yahoo ticker: NVDA, AAPL
   * - Korea proxy/index symbol, etc.
   */
  providerSymbol?: string;

  /**
   * Price display / normalization helpers for later use.
   * Not used yet by the existing chart logic unless you wire them in.
   */
  pricePrecision?: number;

  /**
   * Optional ordering control within the selector.
   */
  order: number;

  /**
   * Used by selector UIs and future route defaults.
   */
  isDefault?: boolean;

  /**
   * Optional tags for filtering / extension later.
   */
  tags?: string[];
};

export type AssetRegistry = Record<AssetSymbol, AssetMetadata>;
