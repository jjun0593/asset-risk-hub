"use client";

import { useMemo, useState } from "react";

import CandleChart from "@/components/chart/CandleChart";
import IntervalSelector from "@/components/chart/IntervalSelector";
import SymbolSelector from "@/components/chart/SymbolSelector";
import AssetClassSelector from "@/components/chart/AssetClassSelector";
import UnsupportedMarketNotice from "@/components/chart/UnsupportedMarketNotice";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EventRiskPanel from "@/components/dashboard/EventRiskPanel";

import { mockEvents } from "@/data/events";
import { normalizeEvents } from "@/features/events/normalizeEvents";
import type { RiskEvent } from "@/features/events/types";

import {
  ASSET_CLASSES,
  CHART_INTERVALS,
  getDefaultSymbolByAssetClass,
  getSymbolsByClass,
  type AssetClass,
  type AssetSymbol,
  type ChartInterval,
} from "@/features/assets";

import { useKlines } from "@/features/market/useKlines";

const DEFAULT_ASSET_CLASS: AssetClass = "crypto";
const DEFAULT_INTERVAL: ChartInterval = "1h";

export default function AssetRiskHub() {
  const [assetClass, setAssetClass] = useState<AssetClass>(DEFAULT_ASSET_CLASS);
  const [symbol, setSymbol] = useState<AssetSymbol>(
    getDefaultSymbolByAssetClass(DEFAULT_ASSET_CLASS)
  );
  const [interval, setInterval] = useState<ChartInterval>(DEFAULT_INTERVAL);

  const normalizedEvents: RiskEvent[] = useMemo(() => {
    return normalizeEvents(mockEvents);
  }, []);

  const symbolOptions = useMemo(() => {
    return getSymbolsByClass(assetClass);
  }, [assetClass]);

  const nonCryptoProbeEnabled = assetClass !== "crypto";

  const {
    candles: probeCandles,
    meta: probeMeta,
    isLoading: isProbeLoading,
    error: probeError,
  } = useKlines({
    symbol,
    interval,
    enabled: nonCryptoProbeEnabled,
  });

  const handleAssetClassChange = (nextAssetClass: AssetClass) => {
    setAssetClass(nextAssetClass);

    const nextSymbols = getSymbolsByClass(nextAssetClass);

    if (!nextSymbols.includes(symbol)) {
      setSymbol(getDefaultSymbolByAssetClass(nextAssetClass));
    }
  };

  const handleSymbolChange = (nextSymbol: AssetSymbol) => {
    setSymbol(nextSymbol);
  };

  const handleIntervalChange = (nextInterval: ChartInterval) => {
    setInterval(nextInterval);
  };

  const shouldShowUnsupportedNotice =
    nonCryptoProbeEnabled &&
    !isProbeLoading &&
    !probeError &&
    probeCandles.length === 0 &&
    probeMeta.supported === false;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        <DashboardHeader
          symbol={symbol}
          interval={interval}
          events={normalizedEvents}
        />

        <section className="grid gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 md:grid-cols-3">
          <AssetClassSelector
            items={[...ASSET_CLASSES]}
            value={assetClass}
            onChange={handleAssetClassChange}
          />

          <SymbolSelector
            items={symbolOptions}
            value={symbol}
            onChange={handleSymbolChange}
          />

          <IntervalSelector
            items={[...CHART_INTERVALS]}
            value={interval}
            onChange={handleIntervalChange}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {shouldShowUnsupportedNotice ? (
              <UnsupportedMarketNotice
                symbol={symbol}
                reason={probeMeta.reason}
              />
            ) : (
              <CandleChart
                symbol={symbol}
                interval={interval}
                events={normalizedEvents}
              />
            )}
          </div>

          <EventRiskPanel symbol={symbol} events={normalizedEvents} />
        </section>
      </div>
    </div>
  );
}