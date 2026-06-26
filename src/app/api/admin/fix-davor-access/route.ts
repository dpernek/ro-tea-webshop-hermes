import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const email = "davor.pernek@ro-tea.hr";
    
    // Use raw SQL to bypass Prisma schema validation for missing columns
    const existing = await db.$queryRawUnsafe<Array<{id:string;email:string;name:string|null;role:string}>>(
      `SELECT id, email, name, role FROM "User" WHERE email = $1`, email
    );

    const user = existing[0];
    const hash = await bcrypt.hash("admin", 12);
    let action = "";

    if (!user) {
      await db.$executeRawUnsafe(
        `INSERT INTO "User" (id, email, name, role, "passwordHash", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
        email, "Davor", "ADMIN", hash
      );
      action = "created";
    } else {
      if (user.role !== "ADMIN") {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET role = 'ADMIN', "updatedAt" = NOW() WHERE email = $1`, email
        );
        action = "promoted_to_admin";
      }
      await db.$executeRawUnsafe(
        `UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE email = $2`, hash, email
      );
      action = action || "password_reset";
    }

    const finalUser = await db.$queryRawUnsafe<Array<any>>(
      `SELECT id, email, name, role FROM "User" WHERE email = $1`, email
    );

    return NextResponse.json({
      email,
      action,
      user: finalUser[0],
      tempPassword: "admin",
      canLogin: true,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
