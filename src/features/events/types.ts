export type EventImpact = "low" | "medium" | "high";

export type EventCategory =
  | "macro"
  | "fed"
  | "earnings"
  | "token"
  | "exchange"
  | "network"
  | "jobs"
  | "upgrade"
  | "other";

export type AssetSymbol =
  | "BTCUSDT"
  | "ETHUSDT"
  | "SOLUSDT"
  | "XRPUSDT"
  | "SUIUSDT";

export type ChartInterval = "1m" | "3m" | "5m" | "15m" | "1h" | "4h" | "1d";

export interface RiskEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: EventCategory;
  impact: EventImpact;
  symbols: AssetSymbol[];
  outcomeSummary?: string;
}
