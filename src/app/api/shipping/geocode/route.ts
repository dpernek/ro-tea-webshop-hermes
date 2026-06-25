import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

// Simple in-memory cache (clears on cold start)
const cache = new Map<string, { lat: number; lng: number; displayName: string }>();

export async function POST(req: NextRequest) {
  try {
    const { address, city, postalCode, countryCode } = await req.json();
    const query = [address, postalCode, city, countryCode || "HR"]
      .filter(Boolean)
      .join(", ");

    // Cache key
    if (cache.has(query)) {
      return NextResponse.json({ success: true, ...cache.get(query) });
    }

    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: countryCode || "hr",
      addressdetails: "0",
    });

    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: {
        "User-Agent": "RO-TEA-Hermes/1.0 (info@ro-tea.hr)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Geocoding service unavailable" });
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Address not found" });
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };

    // Cache for 1 hour (keeps map simple)
    cache.set(query, result);
    return NextResponse.json({ success: true, ...result });

  } catch {
    return NextResponse.json({ success: false, error: "Geocoding failed" });
  }
}
