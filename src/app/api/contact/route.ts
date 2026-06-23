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
      subject: `[RO-TEA Kontakt] ${subject}`,
      html: [
        "<div style='font-family:Arial,sans-serif;max-width:600px'>",
        "<h2 style='color:#0055a8'>Novi upit s web stranice</h2>",
        `<p><strong>Ime:</strong> ${escapeHtml(name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Predmet:</strong> ${escapeHtml(subject)}</p>`,
        `<p><strong>Poruka:</strong></p>`,
        `<p style='white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px'>${escapeHtml(message)}</p>`,
        "</div>",
      ].join(""),
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
