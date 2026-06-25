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

    if (!result || result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "Nema dostupnih GLS paketomata za ovo područje.",
        points: [] 
      });
    }

    const points = (result || []).map((p: any) => ({
      id: p.Id || "",
      name: p.Name || "",
      address: [p.Address, p.ZipCode, p.City].filter(Boolean).join(", "),
    }));

    return NextResponse.json({ success: true, points });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: "GLS paketomati trenutno nisu dostupni. Pokušajte ponovno ili odaberite drugu dostavu.",
      points: [] 
    });
  }
}
