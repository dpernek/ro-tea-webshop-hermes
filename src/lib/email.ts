// Email provider abstraction + professional templates.
import { sendViaGraph, lastError } from "./email/microsoftGraph";

export async function sendEmail(payload: { to: string; subject: string; html: string }): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || "disabled";
  try {
    if (provider === "microsoft-graph") {
      const result = await sendViaGraph(payload);
      if (!result) (sendEmail as any).lastError = lastError;
      return result;
    }
    if (provider === "disabled" || provider === "") {
      console.log("[EMAIL DISABLED] To:", payload.to, "Subject:", payload.subject);
      return false;
    }
    return false;
  } catch (err) { console.error("[EMAIL FAILED]", err); return false; }
}

const BRAND = "#0055a8";
const URL_BASE = "https://ro-tea-webshop-hermes.vercel.app";
const IBAN = "HR8923600001101238701";
const COMPANY = "RO-TEA d.o.o.";

// ── Shared components ───────────────────────────────────────────

const css = `<style>
  body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}
  .wrap{max-width:560px;margin:0 auto;background:#fff}
  .head{background:${BRAND};padding:28px 32px}
  
  .body{padding:32px}
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin:20px 0}
  .card h3{color:#0f172a;margin:0 0 12px;font-size:15px}
  table.w{width:100%;border-collapse:collapse}
  table.w th{text-align:left;padding:8px 10px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #e2e8f0}
  table.w td{padding:10px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9}
  table.w tr:last-child td{border:0}
  .num{text-align:right;white-space:nowrap}
  .total{font-size:18px;font-weight:700;color:${BRAND}}
  .btn{display:inline-block;background:${BRAND};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px}
  .meta{color:#64748b;font-size:13px;line-height:1.6}
  .foot{background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0}
  .foot a{color:#64748b;font-size:11px;text-decoration:none}
  .foot a:hover{color:${BRAND}}
  .qrbox{text-align:center;padding:16px;background:#fff;border:2px dashed #e2e8f0;border-radius:10px;margin-top:12px}
  @media(max-width:480px){.wrap{width:100%!important}.body{padding:20px}.head{padding:20px}}
</style>`;

function header(): string {
  return `<div class="head" style="text-align:center"><img src="${URL_BASE}/images/rotea-logo-white.png" alt="RO-TEA" width="200" height="31" style="height:31px;width:auto;border:0;display:block"/></div>`;
}

function footer(isAdmin: boolean = false): string {
  return `<div class="foot">
    <p style="margin:0 0 8px;color:#94a3b8;font-size:12px"><strong>${COMPANY}</strong> · Badalićeva 26b, 10000 Zagreb · ${IBAN}</p>
    <p style="margin:0 0 12px;color:#94a3b8;font-size:12px">+385 1 3820 113 · info@ro-tea.hr · OIB: 82282361229</p>
    <p style="margin:0;font-size:11px;color:#cbd5e1">
      <a href="${URL_BASE}/uvjeti-kupnje">Uvjeti kupovine</a> &nbsp;·&nbsp;
      <a href="${URL_BASE}/pravila-o-privatnosti">Pravila privatnosti</a> &nbsp;·&nbsp;
      <a href="${URL_BASE}/izjava-o-sigurnosti-online-placanja">Sigurnost plaćanja</a> &nbsp;·&nbsp;
      <a href="${URL_BASE}/pravila-povrata-i-zamjene">Povrat i zamjena</a> &nbsp;·&nbsp;
      <a href="${URL_BASE}/jednostrani-raskid-ugovora">Raskid ugovora</a>
    </p>
    ${isAdmin ? '' : '<p style="margin:12px 0 0;color:#94a3b8;font-size:11px">Primili ste ovaj email jer ste naručili proizvode na RO-TEA webshopu.</p>'}
  </div>`;
}

function itemsTable(items: { name: string; quantity: number; price: number }[]): string {
  let r = "";
  for (const i of items) r += `<tr><td>${i.name}</td><td class="num">${i.quantity}</td><td class="num">${i.price.toFixed(2)} EUR</td></tr>`;
  const sum = items.reduce((s,i) => s + i.price * i.quantity, 0);
  return `<table class="w"><tr><th>Proizvod</th><th style="text-align:right">Kol.</th><th style="text-align:right">Cijena</th></tr>${r}<tr><td colspan="2" style="font-weight:600;border:0">Ukupno</td><td class="num total" style="border:0">${sum.toFixed(2)} EUR</td></tr></table>`;
}

function paymentLabel(method: string): string {
  if (method === "card") return "Kartica (Stripe)";
  if (method === "cod") return "Pouzeće";
  return "Bankovna uplata";
}

function bankPaymentBox(orderNumber: string, total: number): string {
  const amt = total.toFixed(2).replace(".", ",");
  const ref = orderNumber.replace("ROTEA-", "");
  const qr = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(["HRVHUB30","EUR",amt,"","","","","","",IBAN,"HR00",ref,"Narudžba "+orderNumber,COMPANY,"Badalićeva 26b","10000 Zagreb"].join("\n"));
  return `<div class="card" style="border-color:${BRAND};background:#f0f7ff">
    <h3 style="color:${BRAND}">📋 Podaci za uplatu</h3>
    <table style="width:100%;font-size:14px">
      <tr><td style="color:#64748b;padding:3px 0">Primatelj:</td><td style="font-weight:600">${COMPANY}</td></tr>
      <tr><td style="color:#64748b;padding:3px 0">IBAN:</td><td style="font-weight:600">${IBAN}</td></tr>
      <tr><td style="color:#64748b;padding:3px 0">Iznos:</td><td style="font-weight:600;font-size:16px">${amt} EUR</td></tr>
      <tr><td style="color:#64748b;padding:3px 0">Poziv na broj:</td><td style="font-weight:600">${ref}</td></tr>
      <tr><td style="color:#64748b;padding:3px 0">Opis:</td><td>Narudžba ${orderNumber}</td></tr>
    </table>
    <div class="qrbox"><img src="${qr}" alt="QR kod" style="width:180px;height:180px"/><p style="font-size:11px;color:#94a3b8;margin:6px 0 0">Skenirajte kamerom za mobilno plaćanje</p></div>
    <p style="font-size:12px;color:#64748b;margin:10px 0 0">Po primitku uplate narudžba se obrađuje u roku 1-2 radna dana.</p>
  </div>`;
}

// ── Templates ───────────────────────────────────────────────────

export function customerEmail(data: {
  orderNumber: string; total: number; paymentMethod: string; shippingMethod?: string;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const isBank = data.paymentMethod === "bank_transfer";
  const isPickup = data.shippingMethod === "osobno-preuzimanje" || data.shippingMethod?.includes("osobno");
  return `<!DOCTYPE html><html><head>${css}</head><body><div class="wrap">
    ${header()}
    <div class="body">
      <h2 style="color:#0f172a;margin:0 0 4px;font-size:22px">Hvala na narudžbi!</h2>
      <p class="meta">Vaša narudžba je zaprimljena i bit će obrađena u najkraćem roku.</p>
      <div class="card">
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#64748b;padding:2px 0">Broj narudžbe:</td><td style="font-weight:600">${data.orderNumber}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0">Način plaćanja:</td><td>${paymentLabel(data.paymentMethod)}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0">Ukupno:</td><td class="total">${data.total.toFixed(2)} EUR</td></tr>
        </table>
      </div>
      ${isBank ? bankPaymentBox(data.orderNumber, data.total) : ""}
      ${isPickup ? `<div class="card" style="border-color:#0055a8;background:#f0f7ff">
        <h3 style="color:#0055a8">📍 Osobno preuzimanje</h3>
        <p style="margin:0;font-size:14px">Narudžbu možete preuzeti na adresi:</p>
        <p style="margin:4px 0;font-weight:600;font-size:14px">Badalićeva 26b, 10000 Zagreb</p>
        <p style="margin:8px 0 0;font-size:13px;color:#64748b">Radno vrijeme: Pon-Pet 08:00–16:00, Sub 08:00–12:00</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b">Kontakt: +385 1 3820 113</p>
      </div>` : ""}
      <h3 style="color:#0f172a;font-size:15px;margin:24px 0 12px">Naručeni proizvodi</h3>
      ${itemsTable(data.items)}
      <p class="meta" style="margin-top:24px">Račun nije automatski izdan. Ako trebate R1 račun, javite se na <a href="mailto:info@ro-tea.hr" style="color:${BRAND}">info@ro-tea.hr</a>.</p>
      <p class="meta" style="margin-top:16px">Za sva pitanja stojimo vam na raspolaganju.</p>
      <p style="color:#0f172a;font-weight:600">${COMPANY}</p>
    </div>
    ${footer()}
  </div></body></html>`;
}

export function adminNewOrderEmail(data: {
  orderNumber: string; total: number; paymentMethod: string;
  customerName: string; customerEmail: string; customerPhone?: string;
  shippingMethod?: string; items?: { name: string; quantity: number; price: number }[];
}): string {
  return `<!DOCTYPE html><html><head>${css}</head><body><div class="wrap">
    ${header()}
    <div class="body">
      <h2 style="color:#0f172a;margin:0 0 4px;font-size:22px">🛒 Nova narudžba</h2>
      <p class="meta">${data.orderNumber} · ${paymentLabel(data.paymentMethod)}</p>
      <div class="card">
        <h3>Kupac</h3>
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#64748b;padding:2px 0">Ime:</td><td style="font-weight:600">${data.customerName}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0">Email:</td><td>${data.customerEmail}</td></tr>
          ${data.customerPhone ? `<tr><td style="color:#64748b;padding:2px 0">Telefon:</td><td>${data.customerPhone}</td></tr>` : ""}
          <tr><td style="color:#64748b;padding:2px 0">Plaćanje:</td><td>${paymentLabel(data.paymentMethod)}</td></tr>
          ${data.shippingMethod ? `<tr><td style="color:#64748b;padding:2px 0">Dostava:</td><td>${data.shippingMethod}</td></tr>` : ""}
          <tr><td style="color:#64748b;padding:2px 0">Ukupno:</td><td class="total">${data.total.toFixed(2)} EUR</td></tr>
        </table>
      </div>
      ${data.items && data.items.length ? `<h3 style="color:#0f172a;font-size:15px;margin:24px 0 12px">Proizvodi</h3>${itemsTable(data.items)}` : ""}
      <a href="${URL_BASE}/admin/orders" class="btn">Otvori admin panel →</a>
    </div>
    ${footer(true)}
  </div></body></html>`;
}

export function statusChangeEmail(data: {
  orderNumber: string; oldStatus: string; newStatus: string;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const labels: Record<string, string> = {
    CONFIRMED: "Potvrđena", PROCESSING: "U obradi", SHIPPED: "Poslana",
    COMPLETED: "Završena", CANCELLED: "Otkazana", REFUNDED: "Refundirana"
  };
  const label = labels[data.newStatus] || data.newStatus;
  const isPositive = ["SHIPPED","COMPLETED"].includes(data.newStatus);
  return `<!DOCTYPE html><html><head>${css}</head><body><div class="wrap">
    ${header()}
    <div class="body">
      <h2 style="color:#0f172a;margin:0 0 4px;font-size:22px">${isPositive ? "✅" : "📋"} Status narudžbe</h2>
      <div class="card" style="text-align:center;padding:28px">
        <p style="color:#64748b;font-size:14px;margin:0">Narudžba <strong>${data.orderNumber}</strong></p>
        <p style="font-size:20px;font-weight:700;color:${BRAND};margin:8px 0 0">${label}</p>
        ${data.newStatus === "SHIPPED" ? '<p style="color:#64748b;font-size:13px;margin:6px 0 0">Vaša narudžba je poslana i na putu je prema vama.</p>' : ""}
        ${data.newStatus === "COMPLETED" ? '<p style="color:#64748b;font-size:13px;margin:6px 0 0">Narudžba je uspješno završena. Hvala na povjerenju!</p>' : ""}
      </div>
      ${data.items.length ? `<h3 style="color:#0f172a;font-size:15px;margin:24px 0 12px">Proizvodi u narudžbi</h3>${itemsTable(data.items)}` : ""}
      <p class="meta" style="margin-top:24px">Za sva pitanja kontaktirajte nas na <a href="mailto:info@ro-tea.hr" style="color:${BRAND}">info@ro-tea.hr</a> ili +385 1 3820 113.</p>
      <p style="color:#0f172a;font-weight:600">${COMPANY}</p>
    </div>
    ${footer()}
  </div></body></html>`;
}

export function adminPaymentAlert(data: {
  orderNumber: string; status: string; customerEmail: string; message?: string;
}): string {
  const isGood = data.status === "PAID";
  return `<!DOCTYPE html><html><head>${css}</head><body><div class="wrap">
    ${header()}
    <div class="body">
      <h2 style="color:#0f172a;margin:0 0 4px;font-size:22px">${isGood ? "✅" : "⚠️"} ${isGood ? "Plaćanje potvrđeno" : "Problem s plaćanjem"}</h2>
      <div class="card">
        <table style="width:100%;font-size:14px">
          <tr><td style="color:#64748b;padding:2px 0">Narudžba:</td><td style="font-weight:600">${data.orderNumber}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0">Kupac:</td><td>${data.customerEmail}</td></tr>
          <tr><td style="color:#64748b;padding:2px 0">Status:</td><td style="color:${isGood ? "#16a34a" : "#dc2626"};font-weight:600">${data.status}</td></tr>
          ${data.message ? `<tr><td style="color:#64748b;padding:2px 0">Detalji:</td><td>${data.message}</td></tr>` : ""}
        </table>
      </div>
      <a href="${URL_BASE}/admin/orders" class="btn">Otvori admin panel →</a>
    </div>
    ${footer(true)}
  </div></body></html>`;
}
