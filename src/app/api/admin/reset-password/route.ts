import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const hash = await bcrypt.hash("RoTeaAdmin2026!", 12);
  await db.$executeRawUnsafe(`UPDATE "User" SET "passwordHash" = $1 WHERE email = $2`, hash, "davor.pernek@ro-tea.hr");
  return NextResponse.json({ ok: true });
}
