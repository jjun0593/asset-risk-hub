import type { AssetSymbol } from "@/features/assets";
import type { EventCategory, EventImpact } from "@/features/events/types";

export const ALLOWED_SYMBOLS: AssetSymbol[] = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "SUIUSDT",
];

export const ALLOWED_CATEGORIES: EventCategory[] = [
  "macro",
  "fed",
  "earnings",
  "token",
  "exchange",
  "network",
  "jobs",
  "upgrade",
  "other",
];

export const ALLOWED_IMPACTS: EventImpact[] = ["low", "medium", "high"];
