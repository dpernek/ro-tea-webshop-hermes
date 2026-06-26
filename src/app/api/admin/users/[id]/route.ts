import { NextRequest, NextResponse } from "next/server";
import { requirePermission, getAdminEmail } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Nevažeća e-mail adresa.").transform(e => e.toLowerCase().trim()).optional(),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
  active: z.boolean().optional(),
  newPassword: z.string().min(8, "Lozinka mora imati najmanje 8 znakova.").optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("users", "write");
  if (access) return access;

  const { id } = await params;
  const adminEmail = await getAdminEmail();

  const raw = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] = issue.message;
    return NextResponse.json({ errors }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });

  // Self-protection: prevent self-deactivate, self-downgrade
  const isSelf = adminEmail && adminEmail === user.email.toLowerCase();
  if (isSelf && (parsed.data.active === false || parsed.data.role === "STAFF")) {
    return NextResponse.json({ error: "Ne možete sami sebi ukinuti administratorski pristup." }, { status: 400 });
  }

  // Email uniqueness (normalized)
  if (parsed.data.email) {
    const normalizedEmail = parsed.data.email;
    if (normalizedEmail !== user.email.toLowerCase()) {
      const dup = await db.user.findUnique({ where: { email: normalizedEmail } });
      if (dup) return NextResponse.json({ errors: { email: "E-mail adresa je već zauzeta." } }, { status: 400 });
    }
  }

  // Last admin guard — can't deactivate/downgrade last active admin
  if (parsed.data.active === false || parsed.data.role === "STAFF") {
    const activeAdmins = await db.user.count({ where: { role: "ADMIN", active: true, id: { not: id } } });
    if (activeAdmins === 0 && user.role === "ADMIN") {
      return NextResponse.json({ error: "Nije moguće ukloniti zadnjeg administratora." }, { status: 400 });
    }
  }

  const data: any = {};
  if (parsed.data.name) data.name = parsed.data.name;
  if (parsed.data.email) data.email = parsed.data.email;
  if (parsed.data.role) data.role = parsed.data.role;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.newPassword) data.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  const updated = await db.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, active: true } });
  const action = parsed.data.newPassword ? "password_change" : "edit";
  await logAction("users", action, `Ažuriran korisnik ${updated.email}`, updated.id);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("users", "write");
  if (access) return access;

  const { id } = await params;
  const adminEmail = await getAdminEmail();
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });

  // Self-protection
  if (adminEmail && adminEmail === user.email.toLowerCase()) {
    return NextResponse.json({ error: "Ne možete obrisati vlastiti administratorski račun." }, { status: 400 });
  }

  // Last admin check
  if (user.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN", active: true } });
    if (adminCount <= 1) return NextResponse.json({ error: "Nije moguće ukloniti zadnjeg administratora." }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  await logAction("users", "delete", `Obrisan korisnik ${user.email}`, id);
  return NextResponse.json({ ok: true });
}
