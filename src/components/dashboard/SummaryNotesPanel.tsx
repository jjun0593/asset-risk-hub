"use client";

import { useMemo } from "react";

import { getUpcomingEventsBySymbol } from "@/features/events/lib/getUpcomingEventsBySymbol";
import { formatCountdown } from "@/features/events/lib/formatCountdown";
import { formatUtc } from "@/lib/utils/formatUtc";

import type { AssetSymbol, ChartInterval } from "@/features/assets";
import type { RiskEvent } from "@/features/events/types";

type Props = {
    symbol: AssetSymbol;
    interval: ChartInterval;
    events?: RiskEvent[];
};

function getTimeframeLabel(interval: ChartInterval): string {
    switch (interval) {
        case "1m":
        case "3m":
        case "5m":
            return "very short-term";
        case "15m":
        case "1h":
            return "short-term";
        case "4h":
            return "swing";
        case "1d":
            return "higher timeframe";
        default:
            return "short-term";
    }
}

function getImpactBadgeClass(impact: "high" | "medium" | "low") {
    switch (impact) {
        case "high":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "medium":
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
        case "low":
            return "border-blue-500/30 bg-blue-500/10 text-blue-300";
        default:
            return "border-slate-700 bg-slate-800 text-slate-300";
    }
}

export default function SummaryNotesPanel({
    symbol,
    interval,
    events = [],
}: Props) {
    const timeframeLabel = useMemo(() => {
        return getTimeframeLabel(interval);
    }, [interval]);

    const nextEvent = useMemo(() => {
        return getUpcomingEventsBySymbol(events, symbol, new Date());
    }, [events, symbol]);

    const impactStats = useMemo(() => {
        return events.reduce(
            (acc, event) => {
                if (event.impact === "high") acc.high += 1;
                if (event.impact === "medium") acc.medium += 1;
                if (event.impact === "low") acc.low += 1;
                return acc;
            },
            { high: 0, medium: 0, low: 0 }
        );
    }, [events]);

    const notes = useMemo(() => {
        return [
            `${symbol} is currently monitored on the ${interval} timeframe (${timeframeLabel}).`,
            `${events.length} filtered event(s) are currently active across the dashboard.`,
            nextEvent
                ? `The next upcoming catalyst is ${nextEvent.title}, scheduled for ${formatUtc(
                    nextEvent.date
                )}.`
                : "There is no upcoming event in the current filtered dataset.",
            "Chart markers only render for past events that fall inside the loaded candle range.",
            "Live polling updates the latest candles every 5 seconds without forcing the chart back to the initial position.",
        ];
    }, [symbol, interval, timeframeLabel, events.length, nextEvent]);

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Summary
                </div>
                <div className="mt-1 text-xs text-slate-400">
                    Context for <span className="font-semibold text-slate-200">{symbol}</span>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Current context
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                            <div className="text-xs text-slate-500">Asset</div>
                            <div className="mt-1 text-sm font-semibold text-slate-100">
                                {symbol}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                            <div className="text-xs text-slate-500">Interval</div>
                            <div className="mt-1 text-sm font-semibold text-slate-100">
                                {interval}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">{timeframeLabel}</div>
                        </div>

                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                            <div className="text-xs text-slate-500">Filtered events</div>
                            <div className="mt-1 text-sm font-semibold text-slate-100">
                                {events.length}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                            <div className="text-xs text-slate-500">Next event</div>
                            <div className="mt-1 text-sm font-semibold text-slate-100">
                                {nextEvent ? "Available" : "None"}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Next catalyst
                    </div>

                    {nextEvent ? (
                        <div className="mt-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-100">
                                        {nextEvent.title}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-400">
                                        {formatUtc(nextEvent.date)}
                                    </div>
                                </div>

                                <span
                                    className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getImpactBadgeClass(
                                        nextEvent.impact
                                    )}`}
                                >
                                    {nextEvent.impact}
                                </span>
                            </div>

                            <div className="mt-3 text-xs font-medium text-amber-300">
                                {formatCountdown(nextEvent.date, new Date())}
                            </div>

                            {nextEvent.outcomeSummary && (
                                <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-900/70 p-2 text-xs leading-5 text-slate-300">
                                    {nextEvent.outcomeSummary}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-3 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 text-sm text-slate-500">
                            No upcoming event in the current filtered dataset.
                        </div>
                    )}
                </section>

                <section className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Impact distribution
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-300">
                            High: {impactStats.high}
                        </span>
                        <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                            Medium: {impactStats.medium}
                        </span>
                        <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-300">
                            Low: {impactStats.low}
                        </span>
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Notes
                    </div>

                    {notes.map((note, index) => (
                        <div
                            key={`${symbol}-${interval}-${index}`}
                            className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-sm leading-6 text-slate-300"
                        >
                            {note}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}