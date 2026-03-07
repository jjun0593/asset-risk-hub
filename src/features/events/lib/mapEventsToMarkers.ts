import type { SeriesMarker, Time } from "lightweight-charts";

import { alignToIntervalBucket } from "@/features/events/lib/alignToIntervalBucket";
import type {
  ChartInterval,
  EventImpact,
  RiskEvent,
} from "@/features/events/types";

function getImpactColor(impact: EventImpact): string {
  switch (impact) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
}

function getMarkerLabel(title: string): string {
  const normalized = title.toLowerCase();

  if (normalized.includes("cpi")) return "CPI";
  if (normalized.includes("fomc")) return "FOMC";
  if (normalized.includes("fed")) return "FED";
  if (normalized.includes("unlock")) return "Unlock";
  if (normalized.includes("maintenance")) return "Maint.";
  if (normalized.includes("jobs")) return "Jobs";
  if (normalized.includes("upgrade")) return "Upgrade";

  return title.slice(0, 8);
}

interface MapEventsToMarkersParams {
  events: RiskEvent[];
  interval: ChartInterval;
}

export function mapEventsToMarkers({
  events,
  interval,
}: MapEventsToMarkersParams): SeriesMarker<Time>[] {
  return events.map((event) => {
    const rawTimeMs = new Date(event.date).getTime();
    const alignedTimeMs = alignToIntervalBucket(rawTimeMs, interval);

    return {
      time: Math.floor(alignedTimeMs / 1000) as Time,
      position: "aboveBar",
      shape: "circle",
      color: getImpactColor(event.impact),
      text: getMarkerLabel(event.title),
    };
  });
}
