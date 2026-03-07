import type { UTCTimestamp } from "lightweight-charts";
import type { Candle } from "@/features/market/types";

type BinanceKlineTuple = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

type ObjectKline = {
  time?: number | string;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string;
};

function isBinanceTuple(row: unknown): row is BinanceKlineTuple {
  return Array.isArray(row) && row.length >= 5;
}

function isObjectKline(row: unknown): row is ObjectKline {
  return typeof row === "object" && row !== null;
}

function toArray(input: unknown): unknown[] {
  if (Array.isArray(input)) return input;

  if (typeof input === "string") {
    try {
      return toArray(JSON.parse(input));
    } catch {
      return [];
    }
  }

  if (typeof input !== "object" || input === null) return [];

  const record = input as Record<string, unknown>;

  if (Array.isArray(record.candles)) return record.candles;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.rows)) return record.rows;
  if (Array.isArray(record.klines)) return record.klines;
  if (Array.isArray(record.items)) return record.items;

  if (typeof record.data === "object" && record.data !== null) {
    const dataRecord = record.data as Record<string, unknown>;

    if (Array.isArray(dataRecord.candles)) return dataRecord.candles;
    if (Array.isArray(dataRecord.rows)) return dataRecord.rows;
    if (Array.isArray(dataRecord.klines)) return dataRecord.klines;
    if (Array.isArray(dataRecord.items)) return dataRecord.items;
    if (Array.isArray(dataRecord.data)) return dataRecord.data;
  }

  return [];
}

export function normalizeKlines(input: unknown): Candle[] {
  const rows = toArray(input);

  return rows
    .map((row): Candle | null => {
      if (isBinanceTuple(row)) {
        return {
          time: Math.floor(Number(row[0]) / 1000) as UTCTimestamp,
          open: Number(row[1]),
          high: Number(row[2]),
          low: Number(row[3]),
          close: Number(row[4]),
        };
      }

      if (isObjectKline(row)) {
        const time = row.time;
        const open = row.open;
        const high = row.high;
        const low = row.low;
        const close = row.close;

        if (
          time === undefined ||
          open === undefined ||
          high === undefined ||
          low === undefined ||
          close === undefined
        ) {
          return null;
        }

        const numericTime = Number(time);

        return {
          time:
            numericTime > 10_000_000_000
              ? (Math.floor(numericTime / 1000) as UTCTimestamp)
              : (numericTime as UTCTimestamp),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
        };
      }

      return null;
    })
    .filter((item): item is Candle => item !== null);
}
