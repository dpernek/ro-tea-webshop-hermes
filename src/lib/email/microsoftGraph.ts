const TOKEN_URL="http...onst GRAPH_URL = "https://graph.microsoft.com/v1.0";

function log(msg: string) { console.error("[GRAPH] " + msg); }

export async function sendViaGraph(payload: { to: string; subject: string; html: string }): Promise<boolean> {
  const tid = process.env.MICROSOFT_TENANT_ID;
  const cid = process.env.MICROSOFT_CLIENT_ID;
  const cs = process.env.MICROSOFT_CLIENT_SECRET;
  const sender = process.env.MICROSOFT_SENDER_USER || "info@ro-tea.hr";
  if (!tid || !cid || !cs) { log("Missing env vars"); return false; }

  try {
    // Get token
    const tokenBody = new URLSearchParams({ client_id: cid, client_secret: cs, scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" });
    const tr = await fetch(TOKEN_URL + tid + "/oauth2/v2.0/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: tokenBody.toString() });
    const td = await tr.json();
    if (!tr.ok) { log("Token HTTP " + tr.status + ": " + JSON.stringify(td).slice(0, 400)); return false; }
    if (!td.access_token) { log("No access_token: " + JSON.stringify(td).slice(0, 200)); return false; }
    log("Token OK, expires in " + td.expires_in);

    // Send mail
    const mail = {
      message: {
        subject: payload.subject,
        body: { contentType: "HTML", content: payload.html },
        toRecipients: [{ emailAddress: { address: payload.to } }],
      },
      saveToSentItems: false,
    };

    const mr = await fetch(GRAPH_URL + "/users/" + sender + "/sendMail", {
      method: "POST",
      headers: { Authorization: *** " + td.access_token, "Content-Type": "application/json" },
      body: JSON.stringify(mail),
    });

    if (!mr.ok) {
      const errText = await mr.text().catch(function() { return ""; });
      log("Send HTTP " + mr.status + ": " + errText.slice(0, 500));
      return false;
    }

    if (mr.status === 202) { log("Mail sent (202 Accepted)"); return true; }
    log("Unexpected status: " + mr.status);
    return mr.status < 400;
  } catch (err: any) { log("Exception: " + (err.message || err)); return false; }
}
