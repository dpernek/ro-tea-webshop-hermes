import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function logAction(resource: string, action: string, summary: string, entityId?: string) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id || "unknown";
    const userEmail = (session?.user as any)?.email || "unknown";
    await db.auditLog.create({
      data: { userId, userEmail, resource, entityId: entityId || null, action, summary },
    });
  } catch {
    // Audit log failure must never block the main operation
  }
}
