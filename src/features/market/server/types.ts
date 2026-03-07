import type {
  AssetSymbol,
  ChartInterval,
  MarketDataProvider,
} from "@/features/assets";

export type KlineResponseItem = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type KlinesResult = {
  candles: KlineResponseItem[];
  meta: {
    symbol: AssetSymbol;
    interval: ChartInterval;
    provider: MarketDataProvider;
    supported: boolean;
    reason?: string;
  };
};
