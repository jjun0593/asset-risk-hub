import { ASSET_CLASSES } from "./types";
import {
  DEFAULT_ASSET_CLASS,
  DEFAULT_INTERVAL_BY_ASSET_CLASS,
  DEFAULT_SYMBOL_BY_ASSET_CLASS,
  INTERVALS_BY_ASSET_CLASS,
} from "./constants";
import { assetList, assetRegistry } from "./registry";
import type {
  AssetClass,
  AssetMetadata,
  AssetSymbol,
  ChartInterval,
} from "./types";

export function getAllAssets(): AssetMetadata[] {
  return assetList;
}

export function getAllAssetClasses(): AssetClass[] {
  return [...ASSET_CLASSES];
}

export function getAssetBySymbol(symbol: AssetSymbol): AssetMetadata {
  return assetRegistry[symbol];
}

export function getAssetsByClass(assetClass: AssetClass): AssetMetadata[] {
  return assetList.filter((asset) => asset.assetClass === assetClass);
}

export function getSymbolsByClass(assetClass: AssetClass): AssetSymbol[] {
  return getAssetsByClass(assetClass).map((asset) => asset.symbol);
}

export function getDefaultAssetClass(): AssetClass {
  return DEFAULT_ASSET_CLASS;
}

export function getDefaultSymbolByAssetClass(
  assetClass: AssetClass,
): AssetSymbol {
  return DEFAULT_SYMBOL_BY_ASSET_CLASS[assetClass];
}

export function getAssetClassBySymbol(symbol: AssetSymbol): AssetClass {
  return assetRegistry[symbol].assetClass;
}

export function getDefaultAssetByClass(assetClass: AssetClass): AssetMetadata {
  const assets = getAssetsByClass(assetClass);
  const explicitDefault = assets.find((asset) => asset.isDefault);

  if (explicitDefault) {
    return explicitDefault;
  }

  return assetRegistry[getDefaultSymbolByAssetClass(assetClass)];
}

export function getIntervalsByAssetClass(
  assetClass: AssetClass,
): ChartInterval[] {
  return [...INTERVALS_BY_ASSET_CLASS[assetClass]];
}

export function getDefaultIntervalByAssetClass(
  assetClass: AssetClass,
): ChartInterval {
  return DEFAULT_INTERVAL_BY_ASSET_CLASS[assetClass];
}

export function isIntervalAllowedForAssetClass(
  assetClass: AssetClass,
  interval: ChartInterval,
): boolean {
  return INTERVALS_BY_ASSET_CLASS[assetClass].includes(interval);
}
