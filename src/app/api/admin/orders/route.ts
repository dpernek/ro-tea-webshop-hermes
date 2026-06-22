import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await auth(); if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const status = url.searchParams.get("status") || "";
  const where: any = {};
  if (status) where.status = status;
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    db.order.count({ where }),
  ]);
  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) });
}
