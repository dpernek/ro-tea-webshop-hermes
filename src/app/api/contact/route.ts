import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/contact
 * Accepts contact form submissions and forwards them via email.
 * Rate limiting is applied by the global middleware.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Nevažeći zahtjev." }, { status: 400 });
    }

    const { name, email, subject, message } = body as Record<string, unknown>;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Sva polja su obavezna." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof subject !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Nevažeći format podataka." },
        { status: 400 }
      );
    }

    // Basic validation
    if (name.length > 200 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Tekst je predugačak." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Nevažeća email adresa." },
        { status: 400 }
      );
    }

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL || "info@ro-tea.hr";
    const sent = await sendEmail({
      to: adminEmail,
      subject: `RO-TEA — Novi upit: ${subject}`,
      html: `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif}.wrap{max-width:560px;margin:0 auto;background:#fff}.head{background:#0055a8;padding:24px 32px;text-align:center}.head span{color:#fff;font-size:22px;font-weight:800}.body{padding:32px}.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0}@media(max-width:480px){.body{padding:20px}.head{padding:20px}}</style></head><body><div class="wrap"><div class="head"><span>RO-TEA</span></div><div class="body"><h2 style="color:#0f172a;margin:0 0 4px;font-size:22px">📩 Novi upit s web stranice</h2><div class="card"><table style="width:100%;font-size:14px"><tr><td style="color:#64748b;padding:4px 0">Ime:</td><td style="font-weight:600">${escapeHtml(name)}</td></tr><tr><td style="color:#64748b;padding:4px 0">Email:</td><td>${escapeHtml(email)}</td></tr><tr><td style="color:#64748b;padding:4px 0">Predmet:</td><td>${escapeHtml(subject)}</td></tr></table></div><div class="card"><p style="white-space:pre-wrap;margin:0;font-size:14px;color:#1e293b;line-height:1.6">${escapeHtml(message)}</p></div><p style="color:#64748b;font-size:12px;margin-top:24px">Ovo je automatska poruka s RO-TEA webshopa.</p></div></div></body></html>`,
    });

    if (!sent) {
      console.warn("[contact] Email send failed (non-blocking)");
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[contact] Error:", err);
    return NextResponse.json(
      { error: "Došlo je do greške. Pokušajte ponovo." },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
