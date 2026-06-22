import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await db.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id:true, slug:true, name:true, sku:true, price:true, regularPrice:true, salePrice:true, image:true, featured:true, badge:true, type:true, categoryId:true, brandId:true, shortDescription:true },
  });
  return NextResponse.json(data);
}
