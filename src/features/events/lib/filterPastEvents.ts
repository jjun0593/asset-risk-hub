import type { RiskEvent } from "@/features/events/types";

export function filterPastEvents(events: RiskEvent[]): RiskEvent[] {
  const now = Date.now();

  return events.filter((event) => {
    return new Date(event.date).getTime() <= now;
  });
}
