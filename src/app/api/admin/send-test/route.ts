import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { sendEmail, customerEmail } from "@/lib/email";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const access = await requireAdmin();
  if (access) return access;
  const { to, html: customHtml, subject: customSubject } = await req.json();
  const html = customHtml || customerEmail({
    orderNumber: "ROTEA-20260624-0001", total: 19.64, paymentMethod: "bank_transfer",
    items: [{ name: "Bat 1000g Fiberglass", quantity: 1, price: 13.00 }],
  });
  const subject = customSubject || "RO-TEA - Potvrda narudzbe ROTEA-20260624-0001";
  const ok = await sendEmail({ to: to || "info@ro-tea.hr", subject, html });
  return NextResponse.json({ ok, message: ok ? "Poslano na " + to : "Greska pri slanju" });
}
