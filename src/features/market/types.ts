import type { UTCTimestamp } from "lightweight-charts";

export type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type KlineApiItem = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type KlineApiResponse = {
  candles: KlineApiItem[];
};
