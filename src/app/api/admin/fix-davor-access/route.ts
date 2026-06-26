import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const email = "davor.pernek@ro-tea.hr";
    const USER_SELECT = { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true } as const;
    
    let user = await db.user.findUnique({ where: { email }, select: USER_SELECT });
    
    const result: any = { email };
    
    if (!user) {
      // Create user
      const hash = await bcrypt.hash("admin", 12);
      user = await db.user.create({
        data: { email, name: "Davor", role: "ADMIN", passwordHash: hash },
        select: USER_SELECT,
      });
      result.action = "created";
      result.tempPassword = "admin";
    } else {
      if (user.role !== "ADMIN") {
        user = await db.user.update({
          where: { email },
          data: { role: "ADMIN" },
          select: USER_SELECT,
        });
        result.action = "promoted_to_admin";
      }
      // Reset password to known value
      const hash = await bcrypt.hash("admin", 12);
      await db.user.update({ where: { email }, data: { passwordHash: hash } });
      result.action = result.action || "password_reset";
      result.tempPassword = "admin";
    }
    
    result.user = user;
    result.canLogin = true;
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
