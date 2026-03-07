"use client";

import type { AssetClass } from "@/features/assets";

type Props = {
    value: AssetClass;
    onChange: (value: AssetClass) => void;
    items: AssetClass[];
};

function formatAssetClassLabel(assetClass: AssetClass): string {
    switch (assetClass) {
        case "crypto":
            return "Crypto";
        case "us":
            return "US";
        case "kr":
            return "KR";
        case "metals":
            return "Metals";
        case "fx":
            return "FX";
        default:
            return assetClass;
    }
}

export default function AssetClassSelector({
    value,
    onChange,
    items,
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-400">Asset Class</label>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value as AssetClass)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-slate-500"
            >
                {items.map((assetClass) => (
                    <option key={assetClass} value={assetClass}>
                        {formatAssetClassLabel(assetClass)}
                    </option>
                ))}
            </select>
        </div>
    );
}