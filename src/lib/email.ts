// Email provider abstraction. Controlled by EMAIL_PROVIDER env var.
// Supported: "microsoft-graph", "disabled" (noop).
// Falls back to console.log if provider is missing or unconfigured.

export async function sendEmail(payload: { to: string; subject: string; html: string }): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || "disabled";

  try {
    if (provider === "microsoft-graph") {
      const mg = await import("./email/microsoftGraph");
      return await mg.sendViaGraph(payload);
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

// --- Templates (same for all providers) ---

export function customerEmail(data: {
  orderNumber: string; total: number; paymentMethod: string;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const pm = data.paymentMethod === "card" ? "Kartica (Stripe)" : data.paymentMethod === "cod" ? "Pouzece" : "Bankovna uplata";
  let rows = "";
  for (const it of data.items) {
    rows += "<tr><td style='padding:4px 8px'>" + it.name + "</td><td style='padding:4px 8px;text-align:center'>" + it.quantity + "</td><td style='padding:4px 8px;text-align:right'>" + it.price.toFixed(2) + " EUR</td></tr>";
  }
  return (
    "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>" +
    "<h2 style='color:#0055a8'>Hvala vam na narudzbi!</h2>" +
    "<p>Broj narudzbe: <strong>" + data.orderNumber + "</strong></p>" +
    "<p>Ukupno: <strong>" + data.total.toFixed(2) + " EUR</strong></p>" +
    "<p>Nacin placanja: " + pm + "</p>" +
    "<table style='width:100%;border-collapse:collapse;margin:16px 0'>" +
    "<tr style='background:#f8fafc'><th style='text-align:left;padding:8px'>Proizvod</th><th style='padding:8px'>Kol</th><th style='text-align:right;padding:8px'>Cijena</th></tr>" +
    rows +
    "</table>" +
    "<p style='color:#64748b;font-size:13px;margin-top:24px'>Napomena: Racun nije automatski izdan. Ukoliko trebate R1 racun, javite nam se na info@ro-tea.hr.</p>" +
    "<p style='color:#64748b;font-size:13px'>RO-TEA d.o.o.</p></div>"
  );
}

export function adminNewOrderEmail(data: {
  orderNumber: string; total: number; paymentMethod: string;
  customerName: string; customerEmail: string;
}): string {
  return (
    "<h2>Nova narudzba: " + data.orderNumber + "</h2>" +
    "<p>Kupac: " + data.customerName + " (" + data.customerEmail + ")</p>" +
    "<p>Iznos: <strong>" + data.total.toFixed(2) + " EUR</strong></p>" +
    "<p>Placanje: " + data.paymentMethod + "</p>" +
    "<p><a href='https://ro-tea-webshop-hermes.vercel.app/admin/orders'>Otvori admin panel</a></p>"
  );
}

export function adminPaymentAlert(data: {
  orderNumber: string; status: string; customerEmail: string; message?: string;
}): string {
  const title = data.status === "PAID" ? "Placanje potvrdeno" : "Problem s placanjem";
  return (
    "<h2>" + title + "</h2>" +
    "<p>Narudzba: " + data.orderNumber + "</p>" +
    "<p>Kupac: " + data.customerEmail + "</p>" +
    "<p>Status: " + data.status + "</p>" +
    (data.message ? "<p>" + data.message + "</p>" : "") +
    "<p><a href='https://ro-tea-webshop-hermes.vercel.app/admin/orders'>Admin panel</a></p>"
  );
}
