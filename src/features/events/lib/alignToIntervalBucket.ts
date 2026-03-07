import type { ChartInterval } from "@/features/events/types";
import type { UTCTimestamp } from "lightweight-charts";

function getIntervalSeconds(interval: ChartInterval): number {
  switch (interval) {
    case "1m":
      return 60;
    case "3m":
      return 3 * 60;
    case "5m":
      return 5 * 60;
    case "15m":
      return 15 * 60;
    case "1h":
      return 60 * 60;
    case "4h":
      return 4 * 60 * 60;
    case "1d":
      return 24 * 60 * 60;
    default:
      return 60;
  }
}

export function alignToIntervalBucket(
  timestamp: UTCTimestamp,
  interval: ChartInterval,
): UTCTimestamp {
  const seconds = Number(timestamp);
  const intervalSeconds = getIntervalSeconds(interval);

  return (Math.floor(seconds / intervalSeconds) *
    intervalSeconds) as UTCTimestamp;
}
