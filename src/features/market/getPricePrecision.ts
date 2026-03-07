export function getPricePrecision(symbol: string): number {
  switch (symbol) {
    case "BTCUSDT":
      return 2;
    case "ETHUSDT":
      return 2;
    case "SOLUSDT":
      return 3;
    case "XRPUSDT":
      return 4;
    case "DOGEUSDT":
      return 5;
    default:
      return 4;
  }
}
