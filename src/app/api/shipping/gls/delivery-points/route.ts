import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GLS official delivery points JSON feed
const GLS_JSON = "https://map.gls-hungary.com/data/deliveryPoints/hr.json";

let cache: { data: any[]; ts: number } | null = null;

async function getPoints() {
  if (cache && Date.now() - cache.ts < 3600000) return cache.data;
  try {
    const res = await fetch(GLS_JSON);
    const json = await res.json();
    cache = { data: json.items || [], ts: Date.now() };
    return cache.data;
  } catch {
    return cache?.data || [];
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city")?.toLowerCase() || "";

  try {
    const all = await getPoints();
    let points = all.filter((p: any) => p.type === "parcel-locker");
    if (city) {
      const filtered = points.filter((p: any) =>
        p.contact?.city?.toLowerCase().includes(city)
      );
      if (filtered.length > 0) points = filtered;
    }

    const result = points.map((p: any) => ({
      id: p.id,
      name: p.name,
      address: `${p.contact?.address || ""}, ${p.contact?.postalCode || ""} ${p.contact?.city || ""}`,
      city: p.contact?.city || "",
      lat: p.location?.[0],
      lng: p.location?.[1],
    }));

    return NextResponse.json({ success: true, points: result });
  } catch {
    return NextResponse.json({ success: false, points: [], error: "GLS podaci nisu dostupni." });
  }
}
