import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Shared admin authorization guard.
 * Returns null if user is valid admin, or a NextResponse with 401/403.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // OK — admin
}
