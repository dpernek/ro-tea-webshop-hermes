import { NextResponse } from "next/server"; import { auth } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() { const s=await auth(); if(!s?.user) return NextResponse.json({error:"Unauthorized"},{status:401}); return NextResponse.json(await db.customer.findMany({orderBy:{createdAt:"desc"},take:50})); }
