import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Nevažeća e-mail adresa.").optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8, "Lozinka mora imati najmanje 8 znakova.").optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access) return access;

  const { id } = await params;
  const raw = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return NextResponse.json({ errors }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });

  // Email uniqueness
  if (parsed.data.email && parsed.data.email !== user.email) {
    const dup = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (dup) return NextResponse.json({ errors: { email: "E-mail adresa je već zauzeta." } }, { status: 400 });
  }

  // Last admin guard — can't deactivate/downgrade last active admin
  if (parsed.data.active === false || parsed.data.role === "STAFF") {
    const activeAdmins = await db.user.count({ where: { role: "ADMIN", active: true, id: { not: id } } });
    if (activeAdmins === 0) {
      return NextResponse.json({ error: "Ne možete deaktivirati/ukloniti zadnjeg administratora." }, { status: 400 });
    }
  }

  const data: any = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.email) data.email = parsed.data.email;
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.newPassword) data.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  const updated = await db.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, active: true } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requireAdmin();
  if (access) return access;

  const { id } = await params;
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });

  // Last admin check
  if (user.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN", active: true } });
    if (adminCount <= 1) return NextResponse.json({ error: "Nije moguće ukloniti zadnjeg administratora." }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
