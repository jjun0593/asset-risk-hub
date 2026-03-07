import { mockEvents } from "@/data/events";
import { normalizeEvents } from "@/features/events/normalizeEvents";
import type { RiskEvent } from "@/features/events/types";

type RawEventSource = unknown[];

async function loadMockEventSource(): Promise<RawEventSource> {
  return mockEvents;
}

function normalizeEventSource(rawEvents: RawEventSource): RiskEvent[] {
  return normalizeEvents(rawEvents);
}

export async function fetchEvents(): Promise<RiskEvent[]> {
  const rawEvents = await loadMockEventSource();
  const events = normalizeEventSource(rawEvents);

  return events;
}
