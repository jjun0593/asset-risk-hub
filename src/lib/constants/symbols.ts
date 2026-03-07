import { getSymbolsByClass } from "@/features/assets";
import type { AssetSymbol } from "@/features/assets";

export const SYMBOLS: AssetSymbol[] = getSymbolsByClass("crypto");
