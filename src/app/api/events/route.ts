import { NextRequest, NextResponse } from "next/server";

import {
  ALLOWED_CATEGORIES,
  ALLOWED_IMPACTS,
  ALLOWED_SYMBOLS,
} from "@/features/events/constants";
import { fetchEvents } from "@/features/events/fetchEvents";
import type {
  AssetSymbol,
  EventCategory,
  EventImpact,
  RiskEvent,
} from "@/features/events/types";

function isAssetSymbol(value: string): value is AssetSymbol {
  return ALLOWED_SYMBOLS.includes(value as AssetSymbol);
}

function isEventCategory(value: string): value is EventCategory {
  return ALLOWED_CATEGORIES.includes(value as EventCategory);
}

function isEventImpact(value: string): value is EventImpact {
  return ALLOWED_IMPACTS.includes(value as EventImpact);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const symbolParam = searchParams.get("symbol");
    const categoryParam = searchParams.get("category");
    const impactParam = searchParams.get("impact");

    const allEvents = await fetchEvents();

    let events: RiskEvent[] = allEvents;

    if (symbolParam && isAssetSymbol(symbolParam)) {
      events = events.filter((event) => event.symbols.includes(symbolParam));
    }

    if (categoryParam && isEventCategory(categoryParam)) {
      events = events.filter((event) => event.category === categoryParam);
    }

    if (impactParam && isEventImpact(impactParam)) {
      events = events.filter((event) => event.impact === impactParam);
    }

    return NextResponse.json({
      events,
      total: events.length,
    });
  } catch (error) {
    console.error("[/api/events] GET error:", error);

    return NextResponse.json(
      {
        events: [],
        total: 0,
        error: "Failed to load events.",
      },
      { status: 500 },
    );
  }
}
