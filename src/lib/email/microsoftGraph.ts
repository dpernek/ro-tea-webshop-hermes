// Microsoft Graph email provider using OAuth2 client credentials flow.
const TOKEN_URL = "https://login.microsoftonline.com/";
const GRAPH_URL = "https://graph.microsoft.com/v1.0";
export let lastError = "";

export async function sendViaGraph(p: { to: string; subject: string; html: string }): Promise<boolean> {
  lastError = "";
  const tid = process.env.MICROSOFT_TENANT_ID;
  const cid = process.env.MICROSOFT_CLIENT_ID;
  const cs = process.env.MICROSOFT_CLIENT_SECRET;
  const sender = process.env.MICROSOFT_SENDER_USER || "info@ro-tea.hr";
  if (!tid || !cid || !cs) { lastError = "Missing env vars"; return false; }

  try {
    // Get OAuth2 token
    const tokenBody = new URLSearchParams({
      client_id: cid,
      client_secret: cs,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const tr = await fetch(TOKEN_URL + tid + "/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tr.ok) {
      const td = await tr.json();
      lastError = "Token HTTP " + tr.status + ": " + JSON.stringify(td).slice(0, 300);
      return false;
    }

    const td = await tr.json();
    if (!td.access_token) {
      lastError = "No access_token in response";
      return false;
    }

    // Send email
    const mailBody = {
      message: {
        subject: p.subject,
        body: { contentType: "HTML", content: p.html },
        toRecipients: [{ emailAddress: { address: p.to } }],
      },
      saveToSentItems: false,
    };

    const authHeader = "Bearer " + td.access_token;
    const mr = await fetch(GRAPH_URL + "/users/" + sender + "/sendMail", {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(mailBody),
    });

    if (mr.status === 202) return true;

    const et = await mr.text().catch(function() { return ""; });
    lastError = "Send HTTP " + mr.status + ": " + et.slice(0, 400);
    return false;
  } catch (e: any) {
    lastError = "Exception: " + (e.message || String(e));
    return false;
  }
}
