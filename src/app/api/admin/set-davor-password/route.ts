import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST() {
  const email = "davor.pernek@ro-tea.hr";
  const newPassword = "RoTeaAdmin2026!";
  const hash = await bcrypt.hash(newPassword, 12);
  
  await db.$executeRawUnsafe(
    `UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2`, hash, email
  );

  const user = await db.$queryRawUnsafe<Array<any>>(
    `SELECT id, email, name, role FROM "User" WHERE email = $1`, email
  );

  return NextResponse.json({
    user: user[0],
    passwordSet: true,
  });
}
