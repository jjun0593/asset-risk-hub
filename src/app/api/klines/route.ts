import { NextRequest, NextResponse } from "next/server";

import {
  getKlines,
  parseKlinesRequest,
} from "@/features/market/server/getKlines";

export async function GET(request: NextRequest) {
  try {
    const { symbol, interval, limit } = parseKlinesRequest(
      request.nextUrl.searchParams,
    );

    const result = await getKlines({
      symbol,
      interval,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/klines] GET error:", error);

    return NextResponse.json(
      {
        candles: [],
        meta: {
          provider: "internal",
          supported: false,
          reason: "Internal server error while loading klines",
        },
        error: "Internal server error while loading klines",
      },
      { status: 500 },
    );
  }
}
