"use client";

import { formatUtc } from "@/lib/utils/formatUtc";
import type { ChartInterval, EventImpact } from "@/features/events/types";
import type { MarkerLayout } from "@/components/chart/ChartEventMarkers";

type Props = {
    marker: MarkerLayout | null;
    chartWidth: number;
    chartHeight: number;
    symbol: string;
    interval: ChartInterval;
    tooltipSide: "left" | "right";
    formatImpactLabel: (impact: EventImpact) => string;
    impactBadgeClass: (impact: EventImpact) => string;
};

export default function ChartEventTooltip({
    marker,
    chartWidth,
    chartHeight,
    symbol,
    interval,
    tooltipSide,
    formatImpactLabel,
    impactBadgeClass,
}: Props) {
    if (!marker) return null;

    const event = marker.event;
    const tooltipWidth = 268;
    const tooltipPadding = 12;

    const preferredLeft =
        tooltipSide === "right"
            ? marker.x - tooltipWidth - 16
            : marker.x + 16;

    const tooltipLeft = Math.min(
        Math.max(tooltipPadding, preferredLeft),
        chartWidth - tooltipWidth - tooltipPadding
    );

    const tooltipTop = Math.min(Math.max(16, marker.y + 20), chartHeight - 164);

    return (
        <div
            className="pointer-events-none absolute z-50 w-[268px] rounded-2xl border border-slate-700/70 bg-slate-950/95 p-3 shadow-2xl"
            style={{
                left: tooltipLeft,
                top: tooltipTop,
            }}
        >
            <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Event marker
                    </p>
                    <h4 className="mt-1 text-sm font-semibold leading-5 text-slate-100">
                        {event.title}
                    </h4>
                </div>

                <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${impactBadgeClass(
                        event.impact
                    )}`}
                >
                    {formatImpactLabel(event.impact)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <p className="text-slate-500">Category</p>
                    <p className="mt-1 text-slate-200">{event.category}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <p className="text-slate-500">Event time</p>
                    <p className="mt-1 text-slate-200">{formatUtc(event.date)}</p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <p className="text-slate-500">Chart bucket</p>
                    <p className="mt-1 text-slate-200">
                        {formatUtc(new Date(Number(marker.bucketTime) * 1000).toISOString())}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <p className="text-slate-500">Symbol / TF</p>
                    <p className="mt-1 text-slate-200">
                        {symbol} · {interval}
                    </p>
                </div>
            </div>

            {event.description ? (
                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Notes
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                        {event.description}
                    </p>
                </div>
            ) : null}
        </div>
    );
}