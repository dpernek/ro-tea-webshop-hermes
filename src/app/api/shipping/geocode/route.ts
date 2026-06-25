import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

interface CacheEntry {
  lat: number; lng: number; displayName: string;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const TTL = 3600000; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { address, city, postalCode, countryCode } = await req.json();
    const query = [address, postalCode, city, countryCode || "HR"]
      .filter(Boolean)
      .join(", ");

    // Check cache with TTL
    const cached = cache.get(query);
    if (cached && Date.now() - cached.ts < TTL) {
      return NextResponse.json({
        success: true,
        lat: cached.lat,
        lng: cached.lng,
        displayName: cached.displayName,
      });
    }

    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: countryCode || "hr",
      addressdetails: "0",
    });

    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { "User-Agent": "RO-TEA-Hermes/1.0 (info@ro-tea.hr)" },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "Geocoding service unavailable" });
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: "Address not found" });
    }

    const entry: CacheEntry = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
      ts: Date.now(),
    };

    cache.set(query, entry);
    return NextResponse.json({
      success: true,
      lat: entry.lat,
      lng: entry.lng,
      displayName: entry.displayName,
    });

  } catch {
    return NextResponse.json({ success: false, error: "Geocoding failed" });
  }
}
