import type { AssetSymbol, RiskEvent } from "@/features/events/types";

export function getUpcomingEventsBySymbol(
  events: RiskEvent[] | undefined,
  symbol: AssetSymbol,
  now = new Date(),
): RiskEvent | null {
  const safeEvents = Array.isArray(events) ? events : [];
  const nowMs = now.getTime();

  const upcoming = safeEvents
    .filter((event) => {
      const eventMs = new Date(event.date).getTime();
      return event.symbols.includes(symbol) && eventMs > nowMs;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return upcoming[0] ?? null;
}
