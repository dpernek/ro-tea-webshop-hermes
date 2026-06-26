import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = "davor.pernek@ro-tea.hr";
  
  // 1. Check current state using raw SQL
  const rows = await db.$queryRawUnsafe<Array<{
    id: string; email: string; name: string | null; role: string;
    "passwordHash": string; createdAt: Date; updatedAt: Date;
  }>>(`SELECT id, email, name, role, "passwordHash", "createdAt", "updatedAt" FROM "User" WHERE email = $1`, email);

  const user = rows[0];

  if (!user) {
    return NextResponse.json({ status: "no_user", email });
  }

  // 2. Fix: set role=ADMIN, set known password
  const newPassword = "RoTeaAdmin2026!";
  const hash = await bcrypt.hash(newPassword, 12);
  
  await db.$executeRawUnsafe(
    `UPDATE "User" SET role = 'ADMIN', "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2`,
    hash, email
  );

  // 3. Verify the hash works
  const verify = await bcrypt.compare(newPassword, hash);

  // 4. Read back final state WITHOUT passwordHash
  return NextResponse.json({
    status: "fixed",
    previous: { id: user.id, email: user.email, name: user.name, role: user.role },
    newPassword,
    hashVerified: verify,
    finalState: { id: user.id, email: user.email, name: user.name, role: "ADMIN" },
  });
}
