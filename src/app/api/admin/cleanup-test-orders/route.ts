import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete test orders (those created during development/testing)
  const result = await db.order.deleteMany({
    where: { customerEmail: { in: ["t@t.hr", "davor@ro-tea.hr", "davor.pernek@ro-tea.hr", "test@ro-tea.hr"] } }
  });

  return NextResponse.json({ ok: true, deleted: result.count });
}
