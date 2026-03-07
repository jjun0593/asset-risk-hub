"use client";

import type { EventImpact, RiskEvent } from "@/features/events/types";
import type { UTCTimestamp } from "lightweight-charts";

export type MarkerLayout = {
    key: string;
    eventId: string;
    event: RiskEvent;
    bucketTime: UTCTimestamp;
    x: number;
    y: number;
    stackIndex: number;
    impact: EventImpact;
    title: string;
    shortLabel: string;
};

type Props = {
    markers: MarkerLayout[];
    hoveredMarkerKey: string | null;
    chartWidth: number;
    onHover: (key: string | null) => void;
    formatImpactLabel: (impact: EventImpact) => string;
    impactDotClass: (impact: EventImpact) => string;
};

export default function ChartEventMarkers({
    markers,
    hoveredMarkerKey,
    chartWidth,
    onHover,
    formatImpactLabel,
    impactDotClass,
}: Props) {
    return (
        <>
            {markers.map((marker) => {
                const isHovered = hoveredMarkerKey === marker.key;

                const labelWidth = 168;
                const edgePadding = 12;
                const dotToLabelGap = 12;

                const anchorX = marker.x;
                const preferredLabelLeft = anchorX + dotToLabelGap;

                const clampedLabelLeft = Math.min(
                    Math.max(edgePadding, preferredLabelLeft),
                    chartWidth - labelWidth - edgePadding
                );

                return (
                    <button
                        key={marker.key}
                        type="button"
                        className="pointer-events-auto absolute"
                        style={{
                            left: anchorX,
                            top: marker.y,
                            zIndex: isHovered ? 60 : 30 - marker.stackIndex,
                        }}
                        onMouseEnter={() => onHover(marker.key)}
                        onMouseLeave={() =>
                            onHover(hoveredMarkerKey === marker.key ? null : hoveredMarkerKey)
                        }
                        onFocus={() => onHover(marker.key)}
                        onBlur={() =>
                            onHover(hoveredMarkerKey === marker.key ? null : hoveredMarkerKey)
                        }
                        aria-label={`${marker.title} (${formatImpactLabel(marker.impact)})`}
                    >
                        <div className="relative">
                            <span
                                className={`absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-950/80 ${impactDotClass(
                                    marker.impact
                                )}`}
                            />

                            <div
                                className={`absolute top-0 h-8 -translate-y-1/2 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur transition ${isHovered
                                        ? "border-slate-500/70 bg-slate-900/95 text-white shadow-lg"
                                        : "border-slate-700/60 bg-slate-950/85 text-slate-200"
                                    }`}
                                style={{
                                    left: clampedLabelLeft - anchorX,
                                    width: labelWidth,
                                }}
                            >
                                <span className="block truncate">{marker.shortLabel}</span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </>
    );
}