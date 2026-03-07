"use client";

import { formatUtc } from "@/lib/utils/formatUtc";
import type { Candle } from "@/features/market/types";

type Props = {
    candle: Candle | null;
    pricePrecision: number;
};

export default function ChartOhlcPanel({
    candle,
    pricePrecision,
}: Props) {
    if (!candle) return null;

    return (
        <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-2xl border border-slate-700/70 bg-slate-950/92 px-3 py-2 text-xs shadow-xl backdrop-blur">
            <div className="mb-1 flex items-center gap-2">
                <span className="text-slate-500">OHLC</span>
                <span className="text-slate-400">
                    {formatUtc(new Date(Number(candle.time) * 1000).toISOString())}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-slate-300">
                <span>O {candle.open.toFixed(pricePrecision)}</span>
                <span>H {candle.high.toFixed(pricePrecision)}</span>
                <span>L {candle.low.toFixed(pricePrecision)}</span>
                <span>C {candle.close.toFixed(pricePrecision)}</span>
            </div>
        </div>
    );
}