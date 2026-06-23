// Microsoft Graph email provider using OAuth2 client credentials flow.

const TOKEN_URL = "https://login.microsoftonline.com/";
const GRAPH_URL = "https://graph.microsoft.com/v1.0";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendViaGraph(payload: EmailPayload): Promise<boolean> {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const senderUser = process.env.MICROSOFT_SENDER_USER || "info@ro-tea.hr";

  if (!tenantId || !clientId || !clientSecret) {
    console.error("[GRAPH] Missing Microsoft 365 env vars");
    return false;
  }

  try {
    // OAuth2 client credentials token
    const tokenRes = await fetch(TOKEN_URL + tenantId + "/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }).toString(),
    });

    if (!tokenRes.ok) {
      console.error("[GRAPH] Token error:", tokenRes.status);
      return false;
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error("[GRAPH] No access token");
      return false;
    }

    // Send email via Graph API
    const mailBody = {
      message: {
        subject: payload.subject,
        body: { contentType: "HTML", content: payload.html },
        toRecipients: [{ emailAddress: { address: payload.to } }],
        from: { emailAddress: { address: senderUser } },
      },
      saveToSentItems: false,
    };

    const mailRes = await fetch(GRAPH_URL + "/users/" + senderUser + "/sendMail", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + tokenData.access_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailBody),
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text().catch(function() { return ""; });
      console.error("[GRAPH] Send error:", mailRes.status, errText.slice(0, 200));
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GRAPH] Exception:", err);
    return false;
  }
}
