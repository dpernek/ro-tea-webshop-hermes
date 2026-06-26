import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Resource, Action } from "@/lib/permissions";

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

  const email = (session.user.email as string).toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, active: true },
  });

  if (!user || !user.active || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/**
 * Admin guard with permission check.
 * Useful for routes that have resource-specific permissions.
 */
export async function requirePermission(resource: Resource, action: Action): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = (session.user.email as string).toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, active: true },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!hasPermission(user.role, resource, action)) {
    return NextResponse.json({ error: "Forbidden — insufficient permissions." }, { status: 403 });
  }

  return null;
}

/** Returns current admin email for self-protection checks. */
export async function getAdminEmail(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  return (session.user.email as string).toLowerCase().trim();
}

/** Returns current user for audit logging. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const email = (session.user.email as string).toLowerCase().trim();
  return db.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
}
