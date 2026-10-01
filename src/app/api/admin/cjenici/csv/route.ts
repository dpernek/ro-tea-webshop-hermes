import { requireAdmin } from "@/lib/admin-auth";
import { ComplianceError, previewPriceList } from "@/lib/compliance/service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const preview = await previewPriceList();
    return new Response(preview.content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${preview.filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return Response.json(
      {
        errors:
          error instanceof ComplianceError
            ? error.details
            : ["Pregled CSV-a nije dostupan."],
      },
      { status: error instanceof ComplianceError ? error.status : 503 }
    );
  }
}
