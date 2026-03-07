import {
  DEFAULT_ASSET_CLASS,
  DEFAULT_SYMBOL_BY_ASSET_CLASS,
} from "./constants";
import { assetList, assetRegistry } from "./registry";
import type { AssetClass, AssetMetadata, AssetSymbol } from "./types";

export function getAllAssets(): AssetMetadata[] {
  return assetList;
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
  return DEFAULT_SYMBOL_BY_ASSET_CLASS[assetClass] as AssetSymbol;
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
