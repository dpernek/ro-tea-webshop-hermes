import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const access = await requirePermission("audit_log", "read");
  if (access) return access;

  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource");
  const userEmail = searchParams.get("userEmail");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: any = {};
  if (resource) where.resource = resource;
  if (userEmail) where.userEmail = { contains: userEmail, mode: "insensitive" };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo + "T23:59:59.999Z");
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, resource: true, action: true, message: true, userEmail: true, targetId: true, createdAt: true },
  });

  return NextResponse.json(logs);
}
