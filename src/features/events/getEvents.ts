import type {
  AssetSymbol,
  EventCategory,
  EventImpact,
  RiskEvent,
} from "@/features/events/types";

type GetEventsParams = {
  symbol: AssetSymbol;
  category?: EventCategory | "all";
  impact?: EventImpact | "all";
};

type EventsApiResponse = {
  events?: RiskEvent[];
  total?: number;
  error?: string;
};

export async function getEvents({
  symbol,
  category = "all",
  impact = "all",
}: GetEventsParams): Promise<RiskEvent[]> {
  const params = new URLSearchParams();
  params.set("symbol", symbol);

  if (category !== "all") {
    params.set("category", category);
  }

  if (impact !== "all") {
    params.set("impact", impact);
  }

  const response = await fetch(`/api/events?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  const data: EventsApiResponse = await response.json();

  return Array.isArray(data.events) ? data.events : [];
}
