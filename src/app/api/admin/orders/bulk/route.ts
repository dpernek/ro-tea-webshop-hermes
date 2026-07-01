import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED_ACTIONS = ["viewed", "unviewed", "CONFIRMED"] as const;
type BulkAction = typeof ALLOWED_ACTIONS[number];

export async function POST(req: NextRequest) {
  const access = await requirePermission("orders", "write");
  if (access) return access;

  const { ids, action }: { ids: string[]; action: string } = await req.json().catch(() => ({}));
  if (!ids?.length) return NextResponse.json({ error: "Nema odabranih narudžbi" }, { status: 400 });
  if (!ALLOWED_ACTIONS.includes(action as BulkAction)) {
    return NextResponse.json({ error: `Nepoznata akcija: ${action}` }, { status: 400 });
  }

  let updatedCount = 0, skippedCount = 0;

  if (action === "viewed" || action === "unviewed") {
    const viewed = action === "viewed";
    const result = await db.order.updateMany({
      where: { id: { in: ids }, viewed: !viewed },
      data: { viewed },
    });
    updatedCount = result.count;
    skippedCount = ids.length - result.count;
  }

  if (action === "CONFIRMED") {
    // Only transition PENDING → CONFIRMED (safe lifecycle)
    const result = await db.order.updateMany({
      where: { id: { in: ids }, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
    updatedCount = result.count;
    skippedCount = ids.length - result.count;
    // Log each confirmation
    if (updatedCount > 0) {
      logAction("orders", "bulk-confirm", `Bulk: ${updatedCount} narudžbi potvrđeno (${skippedCount} preskočeno)`).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, updatedCount, skippedCount });
}
