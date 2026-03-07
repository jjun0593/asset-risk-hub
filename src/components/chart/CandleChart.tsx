"use client";

import {
    CandlestickSeries,
    ColorType,
    createChart,
    type IChartApi,
    type ISeriesApi,
    type MouseEventParams,
    type Time,
    type UTCTimestamp,
} from "lightweight-charts";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import ChartEventMarkers, {
    type MarkerLayout,
} from "@/components/chart/ChartEventMarkers";
import ChartEventTooltip from "@/components/chart/ChartEventTooltip";
import ChartOhlcPanel from "@/components/chart/ChartOhlcPanel";

import { alignToIntervalBucket } from "@/features/events/lib/alignToIntervalBucket";
import { filterPastEvents } from "@/features/events/lib/filterPastEvents";
import { formatUtc } from "@/lib/utils/formatUtc";

import { normalizeKlines } from "@/features/market/normalizeKlines";
import { getPricePrecision } from "@/features/market/getPricePrecision";
import { mergeCandles } from "@/features/market/mergeCandles";

import type {
    AssetSymbol,
    ChartInterval,
    EventImpact,
    RiskEvent,
} from "@/features/events/types";
import type { Candle } from "@/features/market/types";

type Props = {
    symbol: AssetSymbol;
    interval: ChartInterval;
    events?: RiskEvent[];
};

const POLL_MS = 5_000;

function impactOrder(impact: EventImpact) {
    if (impact === "high") return 0;
    if (impact === "medium") return 1;
    return 2;
}

function impactDotClass(impact: EventImpact) {
    if (impact === "high") {
        return "bg-rose-400 shadow-[0_0_0_1px_rgba(251,113,133,0.35),0_0_18px_rgba(251,113,133,0.35)]";
    }
    if (impact === "medium") {
        return "bg-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_0_16px_rgba(251,191,36,0.25)]";
    }
    return "bg-sky-400 shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_0_14px_rgba(56,189,248,0.22)]";
}

function impactBadgeClass(impact: EventImpact) {
    if (impact === "high") {
        return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    }
    if (impact === "medium") {
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    }
    return "border-sky-500/30 bg-sky-500/10 text-sky-300";
}

function formatImpactLabel(impact: EventImpact) {
    return impact.charAt(0).toUpperCase() + impact.slice(1);
}

function truncateLabel(value: string, max = 16) {
    const clean = value.trim();
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1)}…`;
}

function toUnixSeconds(date: string) {
    return Math.floor(new Date(date).getTime() / 1000) as UTCTimestamp;
}

function getRangeLabel(interval: ChartInterval) {
    switch (interval) {
        case "5m":
            return "Recent intraday";
        case "15m":
            return "Short-term";
        case "1h":
            return "Hourly structure";
        case "4h":
            return "Swing view";
        case "1d":
            return "Daily trend";
        default:
            return interval;
    }
}

export default function CandleChart({
    symbol,
    interval,
    events = [],
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartHostRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);

    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [candles, setCandles] = useState<Candle[]>([]);
    const [markerLayouts, setMarkerLayouts] = useState<MarkerLayout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [hoveredMarkerKey, setHoveredMarkerKey] = useState<string | null>(null);
    const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
    const [chartHeight, setChartHeight] = useState(520);

    const pricePrecision = useMemo(() => getPricePrecision(symbol), [symbol]);

    const visiblePastEvents = useMemo(() => {
        return filterPastEvents(events).sort((a, b) => {
            const impactDiff = impactOrder(a.impact) - impactOrder(b.impact);
            if (impactDiff !== 0) return impactDiff;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [events]);

    const recalculateMarkerLayouts = useCallback(() => {
        const chart = chartRef.current;
        const series = seriesRef.current;

        if (!chart || !series || candles.length === 0) {
            setMarkerLayouts([]);
            return;
        }

        const candleMap = new Map<number, Candle>();
        for (const candle of candles) {
            candleMap.set(Number(candle.time), candle);
        }

        const minTime = Number(candles[0]?.time ?? 0);
        const maxTime = Number(candles[candles.length - 1]?.time ?? 0);

        const grouped = new Map<number, RiskEvent[]>();

        for (const event of visiblePastEvents) {
            const bucketTime = Number(
                alignToIntervalBucket(toUnixSeconds(event.date), interval)
            );

            if (bucketTime < minTime || bucketTime > maxTime) continue;
            if (!candleMap.has(bucketTime)) continue;

            const arr = grouped.get(bucketTime) ?? [];
            arr.push(event);
            grouped.set(bucketTime, arr);
        }

        const nextLayouts: MarkerLayout[] = [];

        Array.from(grouped.entries()).forEach(([bucketTime, bucketEvents]) => {
            const candle = candleMap.get(bucketTime);
            if (!candle) return;

            const x = chart.timeScale().timeToCoordinate(bucketTime as UTCTimestamp);
            const baseY = series.priceToCoordinate(candle.high);

            if (x == null || baseY == null) return;

            const sorted = [...bucketEvents].sort((a, b) => {
                const impactDiff = impactOrder(a.impact) - impactOrder(b.impact);
                if (impactDiff !== 0) return impactDiff;
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            });

            sorted.forEach((event, index) => {
                nextLayouts.push({
                    key: `${event.id}-${bucketTime}-${index}`,
                    eventId: event.id,
                    event,
                    bucketTime: bucketTime as UTCTimestamp,
                    x,
                    y: Math.max(24, baseY - 22 - index * 24),
                    stackIndex: index,
                    impact: event.impact,
                    title: event.title,
                    shortLabel: truncateLabel(event.title, 16),
                });
            });
        });

        setMarkerLayouts(nextLayouts);
    }, [candles, interval, visiblePastEvents]);

    const recalculateMarkerLayoutsRef = useRef(recalculateMarkerLayouts);

    useEffect(() => {
        recalculateMarkerLayoutsRef.current = recalculateMarkerLayouts;
    }, [recalculateMarkerLayouts]);

    const hoveredMarker = useMemo(() => {
        if (!hoveredMarkerKey) return null;
        return (
            markerLayouts.find((marker) => marker.key === hoveredMarkerKey) ?? null
        );
    }, [hoveredMarkerKey, markerLayouts]);

    const markerCount = markerLayouts.length;
    const chartWidth = chartHostRef.current?.clientWidth ?? 900;

    const nextTooltipSide = useMemo(() => {
        const marker = markerLayouts.find((item) => item.key === hoveredMarkerKey);
        if (!marker || !chartHostRef.current) return "left";
        return marker.x > chartHostRef.current.clientWidth * 0.65
            ? "right"
            : "left";
    }, [hoveredMarkerKey, markerLayouts]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const resize = () => {
            const nextHeight = Math.max(420, Math.floor(window.innerHeight * 0.58));
            setChartHeight(nextHeight);
        };

        resize();

        const observer = new ResizeObserver(() => {
            resize();

            if (!chartRef.current || !chartHostRef.current) return;

            chartRef.current.applyOptions({
                width: chartHostRef.current.clientWidth,
                height: Math.max(420, Math.floor(window.innerHeight * 0.58)),
            });

            requestAnimationFrame(() => {
                recalculateMarkerLayoutsRef.current();
            });
        });

        observer.observe(el);
        window.addEventListener("resize", resize);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", resize);
        };
    }, []);

    useEffect(() => {
        if (!chartHostRef.current) return;

        const chart = createChart(chartHostRef.current, {
            width: chartHostRef.current.clientWidth,
            height: chartHeight,
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#94a3b8",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            },
            grid: {
                vertLines: { color: "rgba(148, 163, 184, 0.08)" },
                horzLines: { color: "rgba(148, 163, 184, 0.08)" },
            },
            crosshair: {
                vertLine: {
                    color: "rgba(148, 163, 184, 0.35)",
                    width: 1,
                    labelBackgroundColor: "#0f172a",
                },
                horzLine: {
                    color: "rgba(148, 163, 184, 0.35)",
                    width: 1,
                    labelBackgroundColor: "#0f172a",
                },
            },
            rightPriceScale: {
                borderColor: "rgba(148, 163, 184, 0.14)",
            },
            timeScale: {
                borderColor: "rgba(148, 163, 184, 0.14)",
                timeVisible: true,
                secondsVisible: false,
            },
            localization: {
                priceFormatter: (value: number) => value.toFixed(pricePrecision),
            },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#22c55e",
            borderDownColor: "#ef4444",
            wickUpColor: "#22c55e",
            wickDownColor: "#ef4444",
            priceLineVisible: true,
            lastValueVisible: true,
        });

        chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
            if (!param.time || !param.seriesData) {
                setHoveredCandle(null);
                return;
            }

            const candleData = param.seriesData.get(series);
            if (!candleData || !("open" in candleData)) {
                setHoveredCandle(null);
                return;
            }

            setHoveredCandle({
                time: param.time as UTCTimestamp,
                open: candleData.open,
                high: candleData.high,
                low: candleData.low,
                close: candleData.close,
            });
        });

        const handleVisibleRangeChange = () => {
            requestAnimationFrame(() => {
                recalculateMarkerLayoutsRef.current();
            });
        };

        chart.timeScale().subscribeVisibleLogicalRangeChange(
            handleVisibleRangeChange
        );

        chartRef.current = chart;
        seriesRef.current = series;

        return () => {
            chart
                .timeScale()
                .unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [chartHeight, pricePrecision]);

    useEffect(() => {
        let cancelled = false;
        let intervalId: NodeJS.Timeout | null = null;

        async function fetchInitial() {
            try {
                setIsLoading(true);

                const response = await fetch(
                    `/api/klines?symbol=${symbol}&interval=${interval}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch klines: ${response.status}`);
                }

                const raw = await response.json();
                const nextCandles = normalizeKlines(raw);

                if (cancelled) return;

                setCandles(nextCandles);
                seriesRef.current?.setData(nextCandles);
                chartRef.current?.timeScale().fitContent();
                setLastUpdatedAt(new Date().toISOString());

                requestAnimationFrame(() => {
                    recalculateMarkerLayoutsRef.current();
                });
            } catch (error) {
                console.error(error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        async function pollLatest() {
            try {
                const chart = chartRef.current;
                const series = seriesRef.current;
                if (!chart || !series) return;

                const previousRange = chart.timeScale().getVisibleLogicalRange();

                const response = await fetch(
                    `/api/klines?symbol=${symbol}&interval=${interval}`,
                    { cache: "no-store" }
                );

                if (!response.ok) {
                    throw new Error(`Failed to poll klines: ${response.status}`);
                }

                const raw = await response.json();
                const polledCandles = normalizeKlines(raw);

                if (cancelled) return;

                setCandles((prev) => {
                    const merged = mergeCandles(prev, polledCandles);
                    series.setData(merged);

                    if (previousRange) {
                        chart.timeScale().setVisibleLogicalRange(previousRange);
                    }

                    return merged;
                });

                setLastUpdatedAt(new Date().toISOString());
            } catch (error) {
                console.error(error);
            }
        }

        fetchInitial();
        intervalId = setInterval(pollLatest, POLL_MS);

        return () => {
            cancelled = true;
            if (intervalId) clearInterval(intervalId);
        };
    }, [symbol, interval]);

    useEffect(() => {
        recalculateMarkerLayouts();
    }, [candles, interval, visiblePastEvents, chartHeight, recalculateMarkerLayouts]);

    return (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Price action
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                        {symbol} · {interval} · {getRangeLabel(interval)}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-2.5 py-1">
                        {candles.length} candles
                    </span>
                    <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-2.5 py-1">
                        {markerCount} markers
                    </span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/50"
                style={{ height: chartHeight }}
            >
                <div ref={chartHostRef} className="h-full w-full" />

                <div
                    ref={overlayRef}
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                >
                    <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
                        <div className="rounded-full border border-slate-700/60 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur">
                            {isLoading ? "Loading" : "Live"}
                        </div>
                        <div className="rounded-full border border-slate-700/60 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur">
                            {candles.length} candles
                        </div>
                        <div className="rounded-full border border-slate-700/60 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur">
                            {markerCount} markers
                        </div>
                    </div>

                    <div className="absolute right-3 top-3 z-20 rounded-full border border-slate-700/60 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur">
                        Updated {lastUpdatedAt ? formatUtc(lastUpdatedAt) : "—"}
                    </div>

                    <ChartEventMarkers
                        markers={markerLayouts}
                        hoveredMarkerKey={hoveredMarkerKey}
                        chartWidth={chartWidth}
                        onHover={setHoveredMarkerKey}
                        formatImpactLabel={formatImpactLabel}
                        impactDotClass={impactDotClass}
                    />

                    <ChartEventTooltip
                        marker={hoveredMarker}
                        chartWidth={chartWidth}
                        chartHeight={chartHeight}
                        symbol={symbol}
                        interval={interval}
                        tooltipSide={nextTooltipSide}
                        formatImpactLabel={formatImpactLabel}
                        impactBadgeClass={impactBadgeClass}
                    />

                    {!hoveredMarker && (
                        <ChartOhlcPanel
                            candle={hoveredCandle}
                            pricePrecision={pricePrecision}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}