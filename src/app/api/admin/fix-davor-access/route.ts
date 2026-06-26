import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = "davor.pernek@ro-tea.hr";
    
    const user = await db.user.findUnique({ where: { email }, select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, updatedAt: true } });
    
    const result: any = {};
    
    if (!user) {
      // Create
      const hash = await bcrypt.hash("admin", 12);
      const created = await db.user.create({
        data: { email, name: "Davor", role: "ADMIN", active: true, passwordHash: hash },
        select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
      });
      result.action = "created";
      result.user = created;
      result.tempPassword = "admin";
    } else if (!user.active) {
      // Activate without changing role
      const existingRole = user.role;
      const updated = await db.user.update({
        where: { email },
        data: { active: true },
        select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
      });
      result.action = "activated";
      result.previous = { active: false, role: existingRole };
      result.user = updated;
    } else if (user.role !== "ADMIN") {
      // Already active, just set admin role
      const updated = await db.user.update({
        where: { email },
        data: { role: "ADMIN" },
        select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
      });
      result.action = "promoted";
      result.previous = { role: user.role };
      result.user = updated;
    } else {
      // Active + ADMIN — password issue. Reset password.
      const hash = await bcrypt.hash(body.newPassword || "admin", 12);
      const updated = await db.user.update({
        where: { email },
        data: { passwordHash: hash },
        select: { id: true, email: true, name: true, role: true, active: true, updatedAt: true },
      });
      result.action = "password_reset";
      result.user = updated;
      result.tempPassword = body.newPassword || "admin";
    }
    
    result.canLogin = true;
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
