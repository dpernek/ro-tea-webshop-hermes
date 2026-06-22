import { NextRequest, NextResponse } from "next/server"; import { auth } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { const s=await auth(); if(!s?.user) return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json(await db.shippingMethod.findMany({orderBy:{sortOrder:"asc"}})); }
export async function POST(req:NextRequest) { const s=await auth(); if(!s?.user) return NextResponse.json({error:"Unauthorized"},{status:401}); const b=await req.json(); b.id=b.name.toLowerCase().replace(/[^a-z0-9]+/g,"-"); b.freeAboveAmount=b.freeAboveAmount?parseFloat(b.freeAboveAmount):null; return NextResponse.json(await db.shippingMethod.create({data:b})); }
