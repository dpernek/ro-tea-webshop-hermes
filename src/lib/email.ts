// Email provider abstraction. Controlled by EMAIL_PROVIDER env var.

export async function sendEmail(payload: { to: string; subject: string; html: string }): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || "disabled";
  try {
    if (provider === "microsoft-graph") {
      const mg = await import("./email/microsoftGraph");
      const result = await mg.sendViaGraph(payload);
      if (!result) (sendEmail as any).lastError = mg.lastError;
      return result;
    }
    if (provider === "disabled" || provider === "") {
      console.log("[EMAIL DISABLED] To:", payload.to, "Subject:", payload.subject);
      return false;
    }
    console.log("[EMAIL] Unknown provider:", provider);
    return false;
  } catch (err) {
    console.error("[EMAIL FAILED]", err);
    return false;
  }
}

const IBAN = "HR8923600001101238701";
const RECIPIENT = "RO-TEA d.o.o.";

function generateQRData(amount: string, ref: string, description: string): string {
  // HUB3 format for Croatian mobile banking QR codes
  const lines = [
    "HRVHUB30",
    "EUR",
    amount,
    "",
    "",
    "",
    "",
    "",
    "",
    IBAN,
    "HR00",
    ref,
    description,
    RECIPIENT,
    "Badalićeva 26b",
    "10000 Zagreb",
  ];
  return lines.join("\n");
}

function bankPaymentSection(orderNumber: string, total: number): string {
  const amount = total.toFixed(2).replace(".", ",");
  const ref = orderNumber.replace("ROTEA-", "");
  const description = "Narudžba " + orderNumber;
  const qrData = encodeURIComponent(generateQRData(amount, ref, description));
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + qrData;
  
  return (
    "<div style='background:#f0f7ff;border:1px solid #0055a8;border-radius:8px;padding:16px;margin:16px 0'>" +
    "<h3 style='color:#0055a8;margin-top:0;margin-bottom:12px'>Podaci za uplatu</h3>" +
    "<table style='width:100%'>" +
    "<tr><td style='padding:3px 0;color:#475569'>Primatelj:</td><td><strong>" + RECIPIENT + "</strong></td></tr>" +
    "<tr><td style='padding:3px 0;color:#475569'>IBAN:</td><td><strong>" + IBAN + "</strong></td></tr>" +
    "<tr><td style='padding:3px 0;color:#475569'>Iznos:</td><td><strong>" + amount + " EUR</strong></td></tr>" +
    "<tr><td style='padding:3px 0;color:#475569'>Poziv na broj:</td><td><strong>" + ref + "</strong></td></tr>" +
    "<tr><td style='padding:3px 0;color:#475569'>Opis:</td><td>" + description + "</td></tr>" +
    "</table>" +
    "<div style='text-align:center;margin-top:14px'>" +
    "<img src='" + qrUrl + "' alt='QR za plaćanje' style='width:200px;height:200px;border:1px solid #e2e8f0;border-radius:8px'/>" +
    "<p style='font-size:11px;color:#94a3b8;margin-top:4px'>Skenirajte kamerom za mobilno plaćanje</p>" +
    "</div>" +
    "<p style='font-size:12px;color:#64748b;margin-top:8px'>Po primitku uplate narudžba se šalje u roku 1-2 radna dana.</p>" +
    "</div>"
  );
}

export function customerEmail(data: {
  orderNumber: string; total: number; paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const pm = data.paymentMethod === "card" ? "Kartica (Stripe)" : data.paymentMethod === "cod" ? "Pouzeće" : "Bankovna uplata";
  const isBank = data.paymentMethod === "bank_transfer";
  let rows = "";
  for (const it of data.items) {
    rows += "<tr><td style='padding:4px 8px'>" + it.name + "</td><td style='padding:4px 8px;text-align:center'>" + it.quantity + "</td><td style='padding:4px 8px;text-align:right'>" + it.price.toFixed(2) + " EUR</td></tr>";
  }
  return (
    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>" +
    "<h2 style='color:#0055a8'>Hvala vam na narudžbi!</h2>" +
    "<p>Broj narudžbe: <strong>" + data.orderNumber + "</strong></p>" +
    "<p>Ukupno: <strong>" + data.total.toFixed(2) + " EUR</strong></p>" +
    "<p>Način plaćanja: " + pm + "</p>" +
    (isBank ? bankPaymentSection(data.orderNumber, data.total) : "") +
    "<table style='width:100%;border-collapse:collapse;margin:16px 0'>" +
    "<tr style='background:#f8fafc'><th style='text-align:left;padding:8px'>Proizvod</th><th style='padding:8px'>Kol.</th><th style='text-align:right;padding:8px'>Cijena</th></tr>" +
    rows +
    "</table>" +
    "<p style='color:#64748b;font-size:13px;margin-top:24px'>Napomena: Račun nije automatski izdan. Ukoliko trebate R1 račun, javite nam se na info@ro-tea.hr.</p>" +
    "<p style='color:#64748b;font-size:13px'>RO-TEA d.o.o.</p></div>"
  );
}

export function adminNewOrderEmail(data: {
  orderNumber: string; total: number; paymentMethod: string;
  customerName: string; customerEmail: string;
}): string {
  return (
    "<h2>Nova narudžba: " + data.orderNumber + "</h2>" +
    "<p>Kupac: " + data.customerName + " (" + data.customerEmail + ")</p>" +
    "<p>Iznos: <strong>" + data.total.toFixed(2) + " EUR</strong></p>" +
    "<p>Plaćanje: " + data.paymentMethod + "</p>" +
    "<p><a href='https://ro-tea-webshop-hermes.vercel.app/admin/orders'>Otvori admin panel</a></p>"
  );
}

export function adminPaymentAlert(data: {
  orderNumber: string; status: string; customerEmail: string; message?: string;
}): string {
  const title = data.status === "PAID" ? "Plaćanje potvrđeno" : "Problem s plaćanjem";
  return (
    "<h2>" + title + "</h2>" +
    "<p>Narudžba: " + data.orderNumber + "</p>" +
    "<p>Kupac: " + data.customerEmail + "</p>" +
    "<p>Status: " + data.status + "</p>" +
    (data.message ? "<p>" + data.message + "</p>" : "") +
    "<p><a href='https://ro-tea-webshop-hermes.vercel.app/admin/orders'>Admin panel</a></p>"
  );
}
