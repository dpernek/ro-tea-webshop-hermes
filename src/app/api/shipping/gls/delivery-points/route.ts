import { NextRequest, NextResponse } from "next/server";
import { getDeliveryPoints } from "@/lib/shipping/gls/restClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const city = url.searchParams.get("city") || "";
  const postalCode = url.searchParams.get("postalCode") || "";

  try {
    const result: any = await getDeliveryPoints({
      city: city || undefined,
      postalCode: postalCode || undefined,
    });

    const points = (result || []).map((p: any) => ({
      id: p.Id || "",
      name: p.Name || "",
      address: [p.Address, p.ZipCode, p.City].filter(Boolean).join(", "),
    }));

    return NextResponse.json({ success: true, points, testMode: true });
  } catch {
    // Fallback mock data for testing
    const mockPoints = [
      { id: "1", name: "GLS Paketomat Zagreb Centar", address: "Ilica 123, 10000 Zagreb" },
      { id: "2", name: "GLS Paketomat Zagreb Istok", address: "Dubrava 45, 10000 Zagreb" },
    ];
    return NextResponse.json({ success: true, points: mockPoints, testMode: true });
  }
}
