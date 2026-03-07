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
  groupLabel: string;
  marketDataProvider: MarketDataProvider;
  providerSymbol?: string;
  pricePrecision?: number;
  order: number;
  isDefault?: boolean;
  tags?: string[];
};

export type AssetRegistry = Record<AssetSymbol, AssetMetadata>;
