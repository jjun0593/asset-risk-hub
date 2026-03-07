import {
  ALLOWED_CATEGORIES,
  ALLOWED_IMPACTS,
  ALLOWED_SYMBOLS,
} from "@/features/events/constants";
import type {
  AssetSymbol,
  EventCategory,
  EventImpact,
  RiskEvent,
} from "@/features/events/types";

type RawEvent = {
  id?: string;
  title?: string;
  description?: string;
  date?: string | number | Date;
  category?: string;
  impact?: string;
  symbols?: string[];
  outcomeSummary?: string;
};

function isAssetSymbol(value: string): value is AssetSymbol {
  return ALLOWED_SYMBOLS.includes(value as AssetSymbol);
}

function isEventCategory(value: string): value is EventCategory {
  return ALLOWED_CATEGORIES.includes(value as EventCategory);
}

function isEventImpact(value: string): value is EventImpact {
  return ALLOWED_IMPACTS.includes(value as EventImpact);
}

function normalizeDate(value: RawEvent["date"]): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

function normalizeSymbols(value: RawEvent["symbols"]): AssetSymbol[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isAssetSymbol);
}

function normalizeCategory(value: RawEvent["category"]): EventCategory {
  if (typeof value === "string" && isEventCategory(value)) {
    return value;
  }

  return "other";
}

function normalizeImpact(value: RawEvent["impact"]): EventImpact {
  if (typeof value === "string" && isEventImpact(value)) {
    return value;
  }

  return "medium";
}

function normalizeId(rawEvent: RawEvent, index: number, date: string): string {
  if (typeof rawEvent.id === "string" && rawEvent.id.trim().length > 0) {
    return rawEvent.id;
  }

  const baseTitle =
    typeof rawEvent.title === "string" && rawEvent.title.trim().length > 0
      ? rawEvent.title.trim()
      : "event";

  return `${baseTitle.toLowerCase().replace(/\s+/g, "-")}-${date}-${index}`;
}

function normalizeTitle(value: RawEvent["title"]): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return "Untitled Event";
}

function normalizeDescription(value: RawEvent["description"]): string {
  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function normalizeOutcomeSummary(
  value: RawEvent["outcomeSummary"],
): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
}

export function normalizeEvents(rawEvents: unknown[]): RiskEvent[] {
  return rawEvents.map((item, index) => {
    const rawEvent = item as RawEvent;
    const date = normalizeDate(rawEvent.date);

    return {
      id: normalizeId(rawEvent, index, date),
      title: normalizeTitle(rawEvent.title),
      description: normalizeDescription(rawEvent.description),
      date,
      category: normalizeCategory(rawEvent.category),
      impact: normalizeImpact(rawEvent.impact),
      symbols: normalizeSymbols(rawEvent.symbols),
      outcomeSummary: normalizeOutcomeSummary(rawEvent.outcomeSummary),
    };
  });
}
