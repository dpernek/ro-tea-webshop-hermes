import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Ime je obavezno."),
  email: z.string().email("Nevažeća e-mail adresa.").transform(e => e.toLowerCase().trim()),
  role: z.enum(["ADMIN", "STAFF"]),
  password: z.string().min(8, "Lozinka mora imati najmanje 8 znakova."),
});

export async function GET() {
  const access = await requirePermission("users", "read");
  if (access) return access;

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const access = await requirePermission("users", "read");
  if (access) return access;

  const raw = await req.json().catch(() => ({}));
  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return NextResponse.json({ errors }, { status: 400 });
  }

  const normalizedEmail = parsed.data.email;
  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return NextResponse.json({ errors: { email: "E-mail adresa je već zauzeta." } }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({ data: { name: parsed.data.name, email: normalizedEmail, role: parsed.data.role, passwordHash } });
  await logAction("users", "create", `Kreiran korisnik ${user.email}`, user.id);
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
