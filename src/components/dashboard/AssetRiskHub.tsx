"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import AssetClassSelector from "@/components/chart/AssetClassSelector";
import CandleChart from "@/components/chart/CandleChart";
import IntervalSelector from "@/components/chart/IntervalSelector";
import SymbolSelector from "@/components/chart/SymbolSelector";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EventRiskPanel from "@/components/dashboard/EventRiskPanel";
import SummaryNotesPanel from "@/components/dashboard/SummaryNotesPanel";

import {
  getAllAssetClasses,
  getAssetClassBySymbol,
  getDefaultAssetClass,
  getDefaultSymbolByAssetClass,
  getSymbolsByClass,
} from "@/features/assets";
import {
  ALLOWED_CATEGORIES,
  ALLOWED_IMPACTS,
} from "@/features/events/constants";
import { getEvents } from "@/features/events/getEvents";
import {
  parseCategoryFilter,
  parseImpactFilter,
  parseInterval,
  parseSymbol,
} from "@/features/events/parseEventFilters";
import { INTERVALS } from "@/lib/constants/intervals";

import type { AssetClass, AssetSymbol, ChartInterval } from "@/features/assets";
import type {
  EventCategory,
  EventImpact,
  RiskEvent,
} from "@/features/events/types";

type ImpactFilter = "all" | EventImpact;
type CategoryFilter = "all" | EventCategory;

function getImpactFilterButtonClass(
  value: ImpactFilter,
  current: ImpactFilter
): string {
  const isActive = value === current;

  if (isActive) {
    switch (value) {
      case "high":
        return "border-red-500/30 bg-red-500/10 text-red-300";
      case "medium":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "low":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";
      default:
        return "border-slate-500/30 bg-slate-700/70 text-slate-100";
    }
  }

  return "border-slate-700 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200";
}

function getCategoryFilterButtonClass(
  value: CategoryFilter,
  current: CategoryFilter
): string {
  const isActive = value === current;

  if (isActive) {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }

  return "border-slate-700 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200";
}

function formatImpactLabel(impact: ImpactFilter): string {
  if (impact === "all") return "All";
  return impact.charAt(0).toUpperCase() + impact.slice(1);
}

function formatCategoryLabel(category: CategoryFilter): string {
  if (category === "all") return "All";

  return category
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AssetRiskHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSymbol = searchParams.get("symbol");
  const initialInterval = searchParams.get("interval");
  const initialCategory = searchParams.get("category");
  const initialImpact = searchParams.get("impact");

  const parsedInitialSymbol = parseSymbol(initialSymbol);

  const [symbol, setSymbol] = useState<AssetSymbol>(parsedInitialSymbol);
  const [assetClass, setAssetClass] = useState<AssetClass>(() => {
    try {
      return getAssetClassBySymbol(parsedInitialSymbol);
    } catch {
      return getDefaultAssetClass();
    }
  });
  const [interval, setInterval] = useState<ChartInterval>(
    parseInterval(initialInterval)
  );
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>(
    parseImpactFilter(initialImpact)
  );
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    parseCategoryFilter(initialCategory)
  );
  const [copied, setCopied] = useState(false);

  const isFilterDirty = categoryFilter !== "all" || impactFilter !== "all";
  const categories: CategoryFilter[] = ["all", ...ALLOWED_CATEGORIES];

  const assetClassItems = useMemo(() => getAllAssetClasses(), []);
  const symbolItems = useMemo<AssetSymbol[]>(
    () => getSymbolsByClass(assetClass),
    [assetClass]
  );

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      try {
        const nextEvents = await getEvents({
          symbol,
          category: categoryFilter,
          impact: impactFilter,
        });

        if (!ignore) {
          setEvents(nextEvents);
        }
      } catch (error) {
        console.error("[AssetRiskHub] Failed to load events:", error);

        if (!ignore) {
          setEvents([]);
        }
      }
    }

    loadEvents();
    const timer = window.setInterval(loadEvents, 60_000);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [symbol, categoryFilter, impactFilter]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("symbol", symbol);
    params.set("interval", interval);

    if (categoryFilter === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryFilter);
    }

    if (impactFilter === "all") {
      params.delete("impact");
    } else {
      params.set("impact", impactFilter);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}?${nextQuery}`, { scroll: false });
    }
  }, [
    symbol,
    interval,
    categoryFilter,
    impactFilter,
    router,
    pathname,
    searchParams,
  ]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      setCopied(false);
    }
  }

  function resetFilters() {
    setCategoryFilter("all");
    setImpactFilter("all");
  }

  function handleAssetClassChange(nextAssetClass: AssetClass) {
    setAssetClass(nextAssetClass);
    setSymbol(getDefaultSymbolByAssetClass(nextAssetClass));
  }

  function handleSymbolChange(nextSymbol: AssetSymbol) {
    setSymbol(nextSymbol);
    setAssetClass(getAssetClassBySymbol(nextSymbol));
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-slate-950 p-4 text-slate-100">
      <DashboardHeader symbol={symbol} interval={interval} events={events} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-300">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-100">{symbol}</span>
          <span className="text-slate-500">•</span>

          <span>{assetClass}</span>
          <span className="text-slate-500">•</span>

          <span>{interval}</span>
          <span className="text-slate-500">•</span>

          <span>
            Category:{" "}
            <span className="font-medium text-slate-200">
              {formatCategoryLabel(categoryFilter)}
            </span>
          </span>
          <span className="text-slate-500">•</span>

          <span>
            Impact:{" "}
            <span className="font-medium text-slate-200">
              {formatImpactLabel(impactFilter)}
            </span>
          </span>
          <span className="text-slate-500">•</span>

          <span>
            <span className="font-medium text-slate-100">{events.length}</span>{" "}
            events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-800/80 hover:text-slate-100"
          >
            Copy Link
          </button>

          {copied && (
            <span className="text-[11px] font-medium text-emerald-300">
              Copied
            </span>
          )}
        </div>
      </div>

      {isFilterDirty && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Active Filters
          </span>

          {categoryFilter !== "all" && (
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/15"
            >
              Category: {formatCategoryLabel(categoryFilter)} ×
            </button>
          )}

          {impactFilter !== "all" && (
            <button
              type="button"
              onClick={() => setImpactFilter("all")}
              className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 transition hover:bg-amber-500/15"
            >
              Impact: {formatImpactLabel(impactFilter)} ×
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <AssetClassSelector
            value={assetClass}
            onChange={handleAssetClassChange}
            items={assetClassItems}
          />

          <SymbolSelector
            value={symbol}
            onChange={handleSymbolChange}
            items={symbolItems}
          />

          <IntervalSelector
            value={interval}
            onChange={setInterval}
            items={INTERVALS}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Event Filters
            </div>

            <button
              type="button"
              onClick={resetFilters}
              disabled={!isFilterDirty}
              className={`rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${isFilterDirty
                  ? "border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                  : "cursor-not-allowed border-slate-800 bg-slate-900/40 text-slate-600"
                }`}
            >
              Reset Filters
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-[72px] text-xs font-medium uppercase tracking-wide text-slate-400">
                Category
              </span>

              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCategoryFilter(category)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${getCategoryFilterButtonClass(
                    category,
                    categoryFilter
                  )}`}
                >
                  {formatCategoryLabel(category)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-[72px] text-xs font-medium uppercase tracking-wide text-slate-400">
                Impact
              </span>

              {(["all", ...ALLOWED_IMPACTS] as ImpactFilter[]).map((impact) => (
                <button
                  key={impact}
                  type="button"
                  onClick={() => setImpactFilter(impact)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${getImpactFilterButtonClass(
                    impact,
                    impactFilter
                  )}`}
                >
                  {formatImpactLabel(impact)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {events.length === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-200">
                No events match the current filters.
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Try broadening the category or impact filter to restore results.
              </div>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-amber-200 transition hover:bg-amber-500/15"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid flex-1 grid-cols-12 gap-4">
        <div className="col-span-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-3">
          <EventRiskPanel symbol={symbol} events={events} />
        </div>

        <div className="col-span-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-6">
          <div className="mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Price Action
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {symbol} on{" "}
                  <span className="font-semibold text-slate-200">
                    {interval}
                  </span>{" "}
                  timeframe
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-3 py-2 text-right">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Marker Mode
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Past events in loaded candle range
                </div>
              </div>
            </div>
          </div>

          <div className="h-[520px] w-full">
            <CandleChart symbol={symbol} interval={interval} events={events} />
          </div>
        </div>

        <div className="col-span-12 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-3">
          <SummaryNotesPanel
            symbol={symbol}
            interval={interval}
            events={events}
          />
        </div>
      </div>
    </main>
  );
}