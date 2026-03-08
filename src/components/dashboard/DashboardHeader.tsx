"use client";

import { useEffect, useMemo, useState } from "react";

import {
    getAssetBySymbol,
    type AssetSymbol,
    type ChartInterval,
} from "@/features/assets";
import { formatCountdown } from "@/features/events/lib/formatCountdown";
import { getUpcomingEventsBySymbol } from "@/features/events/lib/getUpcomingEventsBySymbol";
import type { RiskEvent } from "@/features/events/types";
import { formatUtc } from "@/lib/utils/formatUtc";

type Props = {
    symbol: AssetSymbol;
    interval: ChartInterval;
    events?: RiskEvent[];
    providerName: string;
    providerStatus: "live" | "pending";
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

function formatProviderLabel(provider: string) {
    switch (provider) {
        case "binance":
            return "Binance";
        case "yahoo":
            return "Yahoo";
        case "stooq":
            return "Stooq";
        case "alphaVantage":
            return "Alpha Vantage";
        case "manual":
            return "Manual";
        case "internal":
            return "Internal";
        default:
            return provider;
    }
}

function getProviderStatusClass(status: "live" | "pending") {
    if (status === "live") {
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }

    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

function getProviderStatusText(status: "live" | "pending") {
    return status === "live" ? "Live" : "Pending";
}

export default function DashboardHeader({
    symbol,
    interval,
    events = [],
    providerName,
    providerStatus,
}: Props) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => window.clearInterval(timer);
    }, []);

    const asset = useMemo(() => {
        return getAssetBySymbol(symbol);
    }, [symbol]);

    const nextEvent = useMemo(() => {
        return getUpcomingEventsBySymbol(events, symbol, now);
    }, [events, symbol, now]);

    const providerLabel = formatProviderLabel(providerName);

    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Asset Risk Hub
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                {asset.label}
                            </h1>

                            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                                {symbol}
                            </span>

                            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                                {asset.groupLabel}
                            </span>

                            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300">
                                Provider · {providerLabel}
                            </span>

                            <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getProviderStatusClass(
                                    providerStatus,
                                )}`}
                            >
                                {getProviderStatusText(providerStatus)}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                        <span className="font-medium text-slate-300">UTC</span>{" "}
                        {formatUtc(now)}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Asset
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-100">
                            {asset.label}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">{symbol}</div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Interval
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-100">
                            {interval}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            Active chart timeframe
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Market Data
                        </div>
                        <div className="mt-1 text-sm font-medium text-slate-100">
                            Provider · {providerLabel}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                            {providerStatus === "live"
                                ? "Live market feed connected"
                                : "Configured provider, live feed pending"}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">
                            Next Risk Event
                        </div>

                        {nextEvent ? (
                            <div className="mt-1">
                                <div className="text-sm font-medium text-slate-100">
                                    {nextEvent.title}
                                </div>

                                <div className="mt-1 text-xs text-slate-400">
                                    {formatUtc(nextEvent.date)}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getImpactBadgeClass(
                                            nextEvent.impact,
                                        )}`}
                                    >
                                        {nextEvent.impact}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        {formatCountdown(nextEvent.date, now)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1 text-sm text-slate-400">
                                No upcoming events
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}