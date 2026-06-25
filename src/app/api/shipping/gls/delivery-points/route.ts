import { NextRequest, NextResponse } from "next/server";
import { getDeliveryPoints } from "@/lib/shipping/gls/restClient";
import { isGlsConfigured } from "@/lib/shipping/gls/config";
import type { DeliveryPointResult } from "@/lib/shipping/gls/deliveryPoints";

export const dynamic = "force-dynamic";

// ── Mock delivery points for test mode / fallback ────────────────

interface FlatDeliveryPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  type: string;
  workingHours?: string;
}

function mockDeliveryPoints(city?: string, postalCode?: string): FlatDeliveryPoint[] {
  const all: FlatDeliveryPoint[] = [
    { id: "GLS-001", name: "GLS Paketomat — Avenue Mall", address: "Avenija Dubrovnik 16", city: "Zagreb", postalCode: "10000", type: "PARCEL_LOCKER" },
    { id: "GLS-002", name: "GLS Paketomat — City Center One East", address: "Slavonska avenija 11d", city: "Zagreb", postalCode: "10000", type: "PARCEL_LOCKER" },
    { id: "GLS-003", name: "GLS Paketomat — Konzum Radnička", address: "Radnička cesta 80", city: "Zagreb", postalCode: "10000", type: "PARCEL_LOCKER" },
    { id: "GLS-004", name: "GLS Paketomat — Super Konzum Vukovarska", address: "Vukovarska ulica 246", city: "Zagreb", postalCode: "10000", type: "PARCEL_LOCKER" },
    { id: "GLS-005", name: "GLS Paketomat — City Center One West", address: "Jankomir 25", city: "Zagreb", postalCode: "10000", type: "PARCEL_LOCKER" },
    { id: "GLS-006", name: "GLS Paketomat — Mall of Split", address: "Josipa Jovića 93", city: "Split", postalCode: "21000", type: "PARCEL_LOCKER" },
    { id: "GLS-007", name: "GLS Paketomat — Joker", address: "Put Brodarice 6", city: "Split", postalCode: "21000", type: "PARCEL_LOCKER" },
    { id: "GLS-008", name: "GLS Paketomat — Tower Center Rijeka", address: "Janka Polića Kamova 81a", city: "Rijeka", postalCode: "51000", type: "PARCEL_LOCKER" },
    { id: "GLS-009", name: "GLS Paketomat — ZTC", address: "Zvonimirova 3", city: "Rijeka", postalCode: "51000", type: "PARCEL_LOCKER" },
    { id: "GLS-010", name: "GLS Paketomat — Portanova", address: "Industrijska zona Nemetin", city: "Osijek", postalCode: "31000", type: "PARCEL_LOCKER" },
    { id: "GLS-011", name: "GLS Paketomat — Avenue Mall Osijek", address: "Vukovarska cesta 209b", city: "Osijek", postalCode: "31000", type: "PARCEL_LOCKER" },
    { id: "GLS-012", name: "GLS Paketomat — Dalmare", address: "Put Vrulje 2", city: "Zadar", postalCode: "23000", type: "PARCEL_LOCKER" },
    { id: "GLS-013", name: "GLS Paketomat — City Galleria", address: "Ul. Andrije Hebranga 4", city: "Zadar", postalCode: "23000", type: "PARCEL_LOCKER" },
    { id: "GLS-014", name: "GLS Paketomat — Lumini centar", address: "Vukovarska ulica 84", city: "Varaždin", postalCode: "42000", type: "PARCEL_LOCKER" },
    { id: "GLS-015", name: "GLS Paketomat — Supernova", address: "Zagrebačka ulica 94", city: "Karlovac", postalCode: "47000", type: "PARCEL_LOCKER" },
  ];

  let filtered = all;

  if (city) {
    const cityLower = city.toLowerCase().trim();
    filtered = filtered.filter(p => p.city.toLowerCase().includes(cityLower));
  }

  if (postalCode) {
    const code = postalCode.trim();
    filtered = filtered.filter(p => p.postalCode === code || p.postalCode.startsWith(code.substring(0, 2)));
  }

  // If filters yield no results, return all points
  if (filtered.length === 0 && (city || postalCode)) {
    filtered = all.slice(0, 5);
  }

  return filtered;
}

// ── Route handler ────────────────────────────────────────────────

/**
 * GET /api/shipping/gls/delivery-points?city=Zagreb&postalCode=10000
 *
 * Returns filtered GLS Paketomat delivery points for the checkout form.
 * Uses real GLS API when configured, falls back to mock data otherwise.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || undefined;
    const postalCode = searchParams.get("postalCode") || undefined;

    // Try real GLS API if configured
    if (isGlsConfigured()) {
      try {
        const realPoints: DeliveryPointResult[] = await getDeliveryPoints({
          city,
          zipCode: postalCode,
          language: "HR",
        });

        // Flatten to the format the frontend expects
        const flat = realPoints.map(p => ({
          id: `GLS-${p.id}`,
          name: p.name,
          address: `${p.street}, ${p.zipCode} ${p.city}`,
          city: p.city,
          postalCode: p.zipCode,
          type: p.type,
          workingHours: p.workingHours,
        }));

        return NextResponse.json({ success: true, points: flat, testMode: false });
      } catch (err) {
        console.error("[GLS API] Real API call failed, falling back to mock data:", err);
        // Fall through to mock data
      }
    }

    // Test mode / fallback: use mock data
    const mockPoints = mockDeliveryPoints(city, postalCode);

    return NextResponse.json({
      success: true,
      points: mockPoints,
      testMode: true,
    });
  } catch (err: any) {
    console.error("[GLS API] Error fetching delivery points:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Greška prilikom dohvaćanja GLS paketomata.",
        points: [],
        testMode: true,
      },
      { status: 500 }
    );
  }
}
