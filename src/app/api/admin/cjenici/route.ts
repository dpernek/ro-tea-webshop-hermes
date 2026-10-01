import { NextResponse } from "next/server";
import { getCurrentUser, requireAdmin } from "@/lib/admin-auth";
import {
  ComplianceError,
  complianceReview,
  confirmAnchors,
  publishPriceList,
  savePriceListSettings,
} from "@/lib/compliance/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await complianceReview());
  } catch {
    return NextResponse.json(
      { errors: ["Pregled nije dostupan. Provjerite bazu i migraciju."] },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const actor = await getCurrentUser();
  if (!actor || actor.role !== "ADMIN")
    return NextResponse.json(
      { errors: ["Nedopušten pristup."] },
      { status: 403 }
    );
  try {
    const body = await request.json();
    if (!body || typeof body !== "object")
      return NextResponse.json(
        { errors: ["Neispravan zahtjev."] },
        { status: 400 }
      );
    switch (body.action) {
      case "preview":
        return NextResponse.json(
          await confirmAnchors(body.data, actor.email, true)
        );
      case "confirm":
        return NextResponse.json(
          await confirmAnchors(body.data, actor.email, false)
        );
      case "settings":
        return NextResponse.json(
          await savePriceListSettings(body.data, actor.email)
        );
      case "publish":
        return NextResponse.json(await publishPriceList());
      default:
        return NextResponse.json(
          { errors: ["Nepoznata radnja."] },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof ComplianceError)
      return NextResponse.json(
        { errors: error.details },
        { status: error.status }
      );
    if (error instanceof SyntaxError)
      return NextResponse.json(
        { errors: ["Neispravan zahtjev."] },
        { status: 400 }
      );
    return NextResponse.json(
      {
        errors: [
          "Spremanje nije uspjelo. Osvježite pregled i pokušajte ponovno.",
        ],
      },
      { status: 503 }
    );
  }
}
