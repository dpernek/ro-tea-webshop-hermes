import { NextRequest, NextResponse } from "next/server"; import { auth } from "@/lib/auth"; import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){const s=await auth();if(!s?.user)return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;await db.brand.update({where:{id},data:await req.json()});return NextResponse.json({ok:true});}
export async function DELETE(_req:NextRequest,{params}:{params:Promise<{id:string}>}){const s=await auth();if(!s?.user)return NextResponse.json({error:"Unauthorized"},{status:401});const{id}=await params;await db.brand.delete({where:{id}});return NextResponse.json({ok:true});}
