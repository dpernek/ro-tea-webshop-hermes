import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const fixes: string[] = [];
  const def = "TEXT NOT NULL DEFAULT ''";

  for (const table of ["Category", "Brand"]) {
    for (const col of ["seoTitle", "seoDescription", "introText"]) {
      try {
        const exists = await db.$queryRawUnsafe(
          'SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2',
          table, col
        );
        if ((exists as any[]).length === 0) {
          await db.$executeRawUnsafe('ALTER TABLE "' + table + '" ADD COLUMN IF NOT EXISTS "' + col + '" ' + def);
          fixes.push(table + "." + col + " added");
        }
      } catch (e: any) {
        fixes.push(table + "." + col + " error: " + e.message);
      }
    }
  }
  return NextResponse.json({ fixes });
}
