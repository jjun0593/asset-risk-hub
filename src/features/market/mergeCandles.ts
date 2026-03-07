import type { Candle } from "@/features/market/types";

export function mergeCandles(prev: Candle[], incoming: Candle[]): Candle[] {
  const map = new Map<number, Candle>();

  for (const candle of prev) {
    map.set(candle.time, candle);
  }

  for (const candle of incoming) {
    map.set(candle.time, candle);
  }

  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}
