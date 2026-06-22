import { NextResponse } from "next/server"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { const cats = await db.category.findMany({orderBy:{sortOrder:"asc"}}); const products = await db.product.findMany({where:{status:"ACTIVE"},select:{categoryId:true}}); const map:Record<string,number>={}; products.forEach(p=>{if(p.categoryId) map[p.categoryId]=(map[p.categoryId]||0)+1}); const data = cats.map(c=>({...c,count:map[c.id]||0})); return NextResponse.json(data); }
