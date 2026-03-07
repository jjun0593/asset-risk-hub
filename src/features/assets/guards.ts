import {
  ASSET_CLASSES,
  ASSET_SYMBOLS,
  type AssetClass,
  type AssetSymbol,
} from "./types";

export function isAssetClass(value: string): value is AssetClass {
  return ASSET_CLASSES.includes(value as AssetClass);
}

export function isAssetSymbol(value: string): value is AssetSymbol {
  return ASSET_SYMBOLS.includes(value as AssetSymbol);
}
