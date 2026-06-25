import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Official GLS delivery points JSON data (fetched from GLS CDN)
const GLS_DATA_URL = "https://map.gls-hungary.com/data/deliveryPoints/hr.json";

let cachedPoints: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 3600000; // 1 hour

async function getGlsPoints() {
  const now = Date.now();
  if (cachedPoints && now - cacheTime < CACHE_TTL) {
    return cachedPoints;
  }

  try {
    const res = await fetch(GLS_DATA_URL, { next: { revalidate: 3600 } });
    const data = await res.json();
    cachedPoints = data.items || [];
    cacheTime = now;
    return cachedPoints;
  } catch {
    return cachedPoints || [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city")?.toLowerCase() || "";

  try {
    const allPoints = await getGlsPoints();

    // Filter by type: only parcel lockers
    let points = (allPoints || []).filter((p: any) => p.type === "parcel-locker");

    // Filter by city if provided
    if (city) {
      const cityFiltered = points.filter((p: any) =>
        p.contact?.city?.toLowerCase().includes(city)
      );
      if (cityFiltered.length > 0) points = cityFiltered;
    }

    const result = points.map((p: any) => ({
      id: p.id,
      name: p.name,
      address: `${p.contact?.address || ""}, ${p.contact?.postalCode || ""} ${p.contact?.city || ""}`,
      lat: p.location?.[0],
      lng: p.location?.[1],
    }));

    return NextResponse.json({ success: true, points: result });
  } catch {
    return NextResponse.json({
      success: false,
      error: "GLS podaci trenutno nisu dostupni.",
      points: [],
    });
  }
}
