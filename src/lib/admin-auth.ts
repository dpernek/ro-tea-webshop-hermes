import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Shared admin authorization guard.
 * Verifies both session AND current DB state (prevents stale sessions).
 * Returns null if user is valid admin, or a NextResponse with 401/403.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fresh DB lookup — detect deactivated/downgraded users
  const email = (session.user.email as string).toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, active: true },
  });

  if (!user || !user.active || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null; // OK — admin
}

/** Returns the current admin's email for self-protection checks after requireAdmin() passes. */
export async function getAdminEmail(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return (session.user.email as string).toLowerCase().trim();
}
