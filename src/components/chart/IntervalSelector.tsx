"use client";

import type { ChartInterval } from "@/features/assets";

type Props = {
    value: ChartInterval;
    onChange: (value: ChartInterval) => void;
    items: ChartInterval[];
};

export default function IntervalSelector({
    value,
    onChange,
    items,
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Interval</label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as ChartInterval)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none transition-colors focus:border-slate-500"
            >
                {items.map((interval) => (
                    <option key={interval} value={interval}>
                        {interval}
                    </option>
                ))}
            </select>
        </div>
    );
}