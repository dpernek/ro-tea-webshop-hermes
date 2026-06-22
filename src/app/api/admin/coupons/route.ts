import { NextRequest, NextResponse } from "next/server"; import { auth } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { const s=await auth(); if(!s?.user) return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json(await db.coupon.findMany({orderBy:{createdAt:"desc"}})); }
export async function POST(req:NextRequest) { const s=await auth(); if(!s?.user) return NextResponse.json({error:"Unauthorized"},{status:401}); const b=await req.json(); b.startsAt=b.startsAt?new Date(b.startsAt):null; b.endsAt=b.endsAt?new Date(b.endsAt):null; return NextResponse.json(await db.coupon.create({data:b})); }
