import type { AssetSymbol, ChartInterval } from "@/features/assets";

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

export type { ChartInterval };

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
