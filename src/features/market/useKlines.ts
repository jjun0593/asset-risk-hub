"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AssetSymbol, ChartInterval } from "@/features/assets";
import { fetchKlines } from "@/features/market/fetchKlines";
import type { Candle, KlinesApiResponse } from "@/features/market/types";

type UseKlinesParams = {
  symbol: AssetSymbol;
  interval: ChartInterval;
  enabled?: boolean;
  pollingMs?: number;
};

type UseKlinesResult = {
  candles: Candle[];
  provider: string | null;
  meta: KlinesApiResponse["meta"];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const DEFAULT_POLLING_MS = 5000;

export function useKlines({
  symbol,
  interval,
  enabled = true,
  pollingMs = DEFAULT_POLLING_MS,
}: UseKlinesParams): UseKlinesResult {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [meta, setMeta] = useState<KlinesApiResponse["meta"]>({
    supported: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const runFetch = useCallback(
    async (initial: boolean) => {
      if (!enabled) return;

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      if (initial) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      setError(null);

      try {
        const result = await fetchKlines({
          symbol,
          interval,
          signal: controller.signal,
        });

        setCandles(result.candles);
        setProvider(result.provider);
        setMeta(result.meta);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Unknown fetch error");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    },
    [enabled, symbol, interval],
  );

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      setCandles([]);
      setProvider(null);
      setMeta({ supported: true });
      setError(null);
      setIsLoading(false);
      setIsFetching(false);
      return;
    }

    void runFetch(true);

    const timer = window.setInterval(() => {
      void runFetch(false);
    }, pollingMs);

    return () => {
      window.clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [enabled, pollingMs, runFetch]);

  const refetch = useCallback(async () => {
    await runFetch(false);
  }, [runFetch]);

  return useMemo(
    () => ({
      candles,
      provider,
      meta,
      isLoading,
      isFetching,
      error,
      refetch,
    }),
    [candles, provider, meta, isLoading, isFetching, error, refetch],
  );
}
