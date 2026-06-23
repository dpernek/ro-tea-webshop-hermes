import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, adminNewOrderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const to = process.env.ORDER_NOTIFICATION_EMAIL || "info@ro-tea.hr";
  const html = adminNewOrderEmail({
    orderNumber: "TEST-" + Date.now(),
    total: 0,
    paymentMethod: "test",
    customerName: "Admin Test",
    customerEmail: to,
  });

  const ok = await sendEmail({ to, subject: "RO-TEA Admin testni email", html });

  if (!ok) {
    const lastErr = (sendEmail as any).lastError || "";
    const provider = process.env.EMAIL_PROVIDER;
    if (!provider || provider === "disabled") {
      return NextResponse.json({ ok: false, error: "Email provider nije konfiguriran." });
    }
    if (provider === "microsoft-graph") {
      const missing = [];
      if (!process.env.MICROSOFT_TENANT_ID) missing.push("MICROSOFT_TENANT_ID");
      if (!process.env.MICROSOFT_CLIENT_ID) missing.push("MICROSOFT_CLIENT_ID");
      if (!process.env.MICROSOFT_CLIENT_SECRET) missing.push("MICROSOFT_CLIENT_SECRET");
      if (!process.env.MICROSOFT_SENDER_USER) missing.push("MICROSOFT_SENDER_USER");
      if (missing.length > 0) {
        return NextResponse.json({ ok: false, error: "Nedostaju: " + missing.join(", ") });
      }
      return NextResponse.json({ ok: false, error: "Graph error: " + (lastErr || "Slanje emaila nije uspjelo.") });
    }
    return NextResponse.json({ ok: false, error: "Slanje emaila nije uspjelo." });
  }

  return NextResponse.json({ ok: true, message: "Testni email je poslan na " + to });
}
