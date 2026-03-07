"use client";

import { useEffect, useMemo, useState } from "react";

import type { AssetSymbol, RiskEvent } from "@/features/events/types";
import { formatUtc } from "@/lib/utils/formatUtc";

type Props = {
    symbol: AssetSymbol;
    events?: RiskEvent[];
};

function getImpactBadgeClass(impact: RiskEvent["impact"]): string {
    switch (impact) {
        case "high":
            return "border-red-500/30 bg-red-500/10 text-red-300";
        case "medium":
            return "border-amber-500/30 bg-amber-500/10 text-amber-300";
        case "low":
            return "border-blue-500/30 bg-blue-500/10 text-blue-300";
        default:
            return "border-slate-600 bg-slate-800 text-slate-300";
    }
}

function EventCard({ event }: { event: RiskEvent }) {
    return (
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-100">
                        {event.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                        {formatUtc(event.date)}
                    </div>
                </div>

                <span
                    className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getImpactBadgeClass(
                        event.impact
                    )}`}
                >
                    {event.impact}
                </span>
            </div>

            <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {event.category}
            </div>

            <div className="mt-2 text-sm leading-6 text-slate-300">
                {event.description}
            </div>

            {event.outcomeSummary && (
                <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-950/50 p-2 text-xs leading-5 text-slate-400">
                    {event.outcomeSummary}
                </div>
            )}
        </div>
    );
}

export default function EventRiskPanel({ symbol, events = [] }: Props) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 30_000);

        return () => window.clearInterval(timer);
    }, []);

    const { upcomingEvents, pastEvents } = useMemo(() => {
        const filtered = events.filter((event) => event.symbols.includes(symbol));

        const upcomingEvents = filtered
            .filter((event) => new Date(event.date).getTime() > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const pastEvents = filtered
            .filter((event) => new Date(event.date).getTime() <= now)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { upcomingEvents, pastEvents };
    }, [events, symbol, now]);

    const hasNoEvents = upcomingEvents.length === 0 && pastEvents.length === 0;

    return (
        <div className="flex h-full flex-col">
            <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Event Risk
                </div>
                <div className="mt-1 text-xs text-slate-400">
                    Showing events for{" "}
                    <span className="font-semibold text-slate-200">{symbol}</span>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
                {hasNoEvents ? (
                    <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-500">
                        No events found for this symbol.
                    </div>
                ) : (
                    <>
                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Upcoming
                                </div>
                                <div className="text-xs text-slate-500">
                                    {upcomingEvents.length}
                                </div>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-500">
                                    No upcoming events.
                                </div>
                            ) : (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            )}
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Past
                                </div>
                                <div className="text-xs text-slate-500">{pastEvents.length}</div>
                            </div>

                            {pastEvents.length === 0 ? (
                                <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-sm text-slate-500">
                                    No past events.
                                </div>
                            ) : (
                                pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}