import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Read current column structure from information_schema
  const columns = await db.$queryRawUnsafe<Array<{
    column_name: string; data_type: string; is_nullable: string; column_default: string | null;
  }>>(
    `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`
  );

  // Required columns from Prisma schema
  const required = ["id", "name", "email", "passwordHash", "role", "active", "createdAt", "updatedAt"];
  const existing = columns.map(c => c.column_name);
  const missing = required.filter(r => !existing.includes(r));

  // Fix: add missing columns
  const fixes: string[] = [];
  
  if (!existing.includes("active")) {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true`);
    fixes.push("added active BOOLEAN DEFAULT true");
  }
  if (!existing.includes("name")) {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "name" TEXT`);
    fixes.push("added name TEXT");
  }
  if (!existing.includes("role")) {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CUSTOMER'`);
    fixes.push("added role TEXT DEFAULT 'CUSTOMER'");
  }
  if (!existing.includes("createdAt")) {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()`);
    fixes.push("added createdAt");
  }
  if (!existing.includes("updatedAt")) {
    await db.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()`);
    fixes.push("added updatedAt");
  }

  // Read back final state
  const finalColumns = await db.$queryRawUnsafe<Array<{ column_name: string; data_type: string }>>(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User' ORDER BY ordinal_position`
  );

  return NextResponse.json({
    previous: columns.map(c => ({ name: c.column_name, type: c.data_type })),
    missing,
    fixes,
    final: finalColumns.map(c => ({ name: c.column_name, type: c.data_type })),
  });
}
