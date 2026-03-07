import {
  ALLOWED_CATEGORIES,
  ALLOWED_IMPACTS,
} from "@/features/events/constants";
import { INTERVALS } from "@/lib/constants/intervals";

import { getDefaultSymbolByAssetClass, isAssetSymbol } from "@/features/assets";
import type { AssetSymbol, ChartInterval } from "@/features/assets";
import type { EventCategory, EventImpact } from "@/features/events/types";

export type ImpactFilter = "all" | EventImpact;
export type CategoryFilter = "all" | EventCategory;

const VALID_INTERVALS = new Set<ChartInterval>(INTERVALS);
const VALID_IMPACTS = new Set<ImpactFilter>(["all", ...ALLOWED_IMPACTS]);
const VALID_CATEGORIES = new Set<CategoryFilter>([
  "all",
  ...ALLOWED_CATEGORIES,
]);

export function isValidSymbol(value: string | null): value is AssetSymbol {
  return Boolean(value && isAssetSymbol(value));
}

export function isValidInterval(value: string | null): value is ChartInterval {
  return Boolean(value && VALID_INTERVALS.has(value as ChartInterval));
}

export function isValidImpact(value: string | null): value is ImpactFilter {
  return Boolean(value && VALID_IMPACTS.has(value as ImpactFilter));
}

export function isValidCategory(value: string | null): value is CategoryFilter {
  return Boolean(value && VALID_CATEGORIES.has(value as CategoryFilter));
}

export function parseSymbol(value: string | null): AssetSymbol {
  return isValidSymbol(value) ? value : getDefaultSymbolByAssetClass("crypto");
}

export function parseInterval(value: string | null): ChartInterval {
  return isValidInterval(value) ? value : "5m";
}

export function parseImpactFilter(value: string | null): ImpactFilter {
  return isValidImpact(value) ? value : "all";
}

export function parseCategoryFilter(value: string | null): CategoryFilter {
  return isValidCategory(value) ? value : "all";
}
