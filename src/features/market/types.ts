export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketDataMeta = {
  supported: boolean;
  reason?: string;
};

export type KlinesApiResponse = {
  candles: Candle[];
  provider: string | null;
  meta: MarketDataMeta;
};
