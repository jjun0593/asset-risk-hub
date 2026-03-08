import type { AssetSymbol, ChartInterval } from "@/features/assets";
import type { KlinesApiResponse } from "@/features/market/types";

type FetchKlinesParams = {
  symbol: AssetSymbol;
  interval: ChartInterval;
  signal?: AbortSignal;
};

function isKlinesApiResponse(value: unknown): value is KlinesApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as KlinesApiResponse;

  return (
    Array.isArray(candidate.candles) &&
    typeof candidate.meta === "object" &&
    candidate.meta !== null &&
    typeof candidate.meta.supported === "boolean"
  );
}

export async function fetchKlines({
  symbol,
  interval,
  signal,
}: FetchKlinesParams): Promise<KlinesApiResponse> {
  const searchParams = new URLSearchParams({
    symbol,
    interval,
  });

  const response = await fetch(`/api/klines?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch klines: ${response.status}`);
  }

  const json: unknown = await response.json();

  if (!isKlinesApiResponse(json)) {
    throw new Error("Invalid klines API response shape");
  }

  return json;
}
