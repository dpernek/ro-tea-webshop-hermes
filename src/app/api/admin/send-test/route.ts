import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, customerEmail } from "@/lib/email";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const s = await auth();
  if (!s?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { to, html: customHtml, subject: customSubject } = await req.json();
  const html = customHtml || customerEmail({
    orderNumber: "ROTEA-20260624-0001", total: 19.64, paymentMethod: "bank_transfer",
    items: [{ name: "Bat 1000g Fiberglass", quantity: 1, price: 13.00 }],
  });
  const subject = customSubject || "RO-TEA - Potvrda narudzbe ROTEA-20260624-0001";
  const ok = await sendEmail({ to: to || "info@ro-tea.hr", subject, html });
  return NextResponse.json({ ok, message: ok ? "Poslano na " + to : "Greska pri slanju" });
}
