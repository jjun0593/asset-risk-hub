"use client";

import type { AssetSymbol } from "@/features/events/types";

type Props = {
    value: AssetSymbol;
    onChange: (value: AssetSymbol) => void;
    items: AssetSymbol[];
};

export default function SymbolSelector({ value, onChange, items }: Props) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Symbol</label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as AssetSymbol)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
                {items.map((symbol) => (
                    <option key={symbol} value={symbol}>
                        {symbol}
                    </option>
                ))}
            </select>
        </div>
    );
}