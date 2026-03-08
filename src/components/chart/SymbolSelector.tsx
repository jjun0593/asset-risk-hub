"use client";

import { getAssetBySymbol, type AssetSymbol } from "@/features/assets";

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
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none transition-colors focus:border-slate-500"
            >
                {items.map((symbol) => {
                    const asset = getAssetBySymbol(symbol);

                    return (
                        <option key={symbol} value={symbol}>
                            {asset.label}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}