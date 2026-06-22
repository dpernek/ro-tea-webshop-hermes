import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read fix_categories.sql and execute it
  const fs = await import("fs/promises");
  const path = await import("path");
  const sqlPath = path.join(process.cwd(), "supabase/migrations/0002_fix_categories.sql");
  const sql = await fs.readFile(sqlPath, "utf-8");

  try {
    await db.$executeRawUnsafe(sql);
    return NextResponse.json({ ok: true, message: "Kategorije ažurirane" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
