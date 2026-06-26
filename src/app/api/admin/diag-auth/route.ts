import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = "davor.pernek@ro-tea.hr";
  const password = "RoTeaAdmin2026!";

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "user not found" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  
  return NextResponse.json({
    found: true,
    id: user.id,
    email: user.email,
    role: user.role,
    active: user.active,
    passwordMatch: valid,
  });
}
