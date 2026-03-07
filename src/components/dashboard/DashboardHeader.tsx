"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCountdown } from "@/features/events/lib/formatCountdown";
import { getUpcomingEventsBySymbol } from "@/features/events/lib/getUpcomingEventsBySymbol";
import { formatUtc } from "@/lib/utils/formatUtc";

import type {
    AssetSymbol,
    ChartInterval,
    RiskEvent,
} from "@/features/events/types";

type Props = {
    symbol: AssetSymbol;
    interval: ChartInterval;
    events?: RiskEvent[];
};

function getImpactBadgeClass(impact?: RiskEvent["impact"]) {
    switch (impact) {
        case "high":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "medium":
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
        case "low":
            return "border-blue-500/30 bg-blue-500/10 text-blue-300";
        default:
            return "border-slate-700 bg-slate-800/80 text-slate-300";
    }
}

export default function DashboardHeader({
    symbol,
    interval,
    events = [],
}: Props) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => window.clearInterval(timer);
    }, []);

    const nextEvent = useMemo(() => {
        return getUpcomingEventsBySymbol(events, symbol, now);
    }, [events, symbol, now]);

    return (
        <header className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Utc Time
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                            {formatUtc(now)}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Asset
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                            {symbol}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Interval
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-100">
                            {interval}
                        </div>
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-700/60 bg-slate-950/50 p-3 xl:min-w-[320px]">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Next Risk Event
                    </div>

                    {nextEvent ? (
                        <div className="mt-3">
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
                                {formatCountdown(nextEvent.date, now)}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-3 text-sm text-slate-500">
                            No upcoming events
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}