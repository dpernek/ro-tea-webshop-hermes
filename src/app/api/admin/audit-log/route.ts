import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const access = await requirePermission("audit_log", "read");
  if (access) return access;

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");
  const where: any = {};
  if (resource) where.resource = resource;

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(logs);
}
