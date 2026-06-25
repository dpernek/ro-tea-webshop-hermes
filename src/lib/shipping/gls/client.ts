// GLS SOAP client — handles authentication and raw SOAP communication.
// All calls are server-side only.
import "server-only";
import { getGlsConfig, GlsError } from "./config";

const SOAP_ENV = "http://schemas.xmlsoap.org/soap/envelope/";
const GLS_NS = "http://tempuri.org/";

// ── SOAP envelope builder ────────────────────────────────────────

function soapEnvelope(bodyXml: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="${SOAP_ENV}" xmlns:tem="${GLS_NS}">
  <soap:Header/>
  <soap:Body>
    ${bodyXml}
  </soap:Body>
</soap:Envelope>`;
}

// ── Core SOAP call ───────────────────────────────────────────────

export async function glsSoapCall<TResponse>(
  action: string,
  bodyXml: string,
): Promise<TResponse> {
  const config = getGlsConfig();

  let response: Response;
  try {
    response = await fetch(config.apiBaseUrl + "/ParcelService.svc/soap", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${GLS_NS}ParcelService/${action}`,
      },
      body: soapEnvelope(bodyXml),
    });
  } catch (err) {
    throw new GlsError(
      `GLS SOAP poziv nije uspio — mrežna greška: ${(err as Error).message}`,
      "NETWORK_ERROR",
    );
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new GlsError(
      `GLS SOAP poziv nije uspio — HTTP ${response.status}: ${response.statusText}`,
      "HTTP_ERROR",
      response.status,
    );
  }

  // Check for SOAP fault
  if (
    responseText.includes("<soap:Fault>") ||
    responseText.includes("<SOAP-ENV:Fault>")
  ) {
    const faultMatch = responseText.match(
      /<faultstring[^>]*>([^<]+)<\/faultstring>/i,
    );
    const faultString = faultMatch ? faultMatch[1] : "Nepoznata SOAP greška";
    throw new GlsError(
      `GLS SOAP greška: ${faultString}`,
      "SOAP_FAULT",
      response.status,
    );
  }

  return parseGlsResponse<TResponse>(responseText, action);
}

// ── Response parser ──────────────────────────────────────────────

function parseGlsResponse<T>(xml: string, action: string): T {
  const resultTag = `${action}Result`;
  const resultRegex = new RegExp(
    `<${resultTag}[^>]*>([\\s\\S]*?)<\\/${resultTag}>`,
    "i",
  );
  const match = xml.match(resultRegex);

  if (!match) {
    const actionResponseTag = `${action}Response`;
    const altRegex = new RegExp(
      `<${actionResponseTag}[^>]*>([\\s\\S]*?)<\\/${actionResponseTag}>`,
      "i",
    );
    const altMatch = xml.match(altRegex);
    if (altMatch) {
      return parseXmlToJson(altMatch[1]) as unknown as T;
    }
    throw new GlsError(
      `GLS odgovor nije sadržavao očekivani rezultat za akciju: ${action}`,
      "PARSE_ERROR",
    );
  }

  const resultXml = match[1];

  // Check for GLS-level errors embedded in result
  const errCode = extractXmlValue(resultXml, "ErrorCode");
  const errDesc = extractXmlValue(resultXml, "ErrorDescription");
  if (errCode && errDesc && errCode !== "0") {
    throw new GlsError(
      `GLS API greška [${errCode}]: ${errDesc}`,
      errCode || "GLS_ERROR",
    );
  }

  return { [`${action}Result`]: parseXmlToJson(resultXml) } as unknown as T;
}

// ── Auth XML helper ──────────────────────────────────────────────

export function glsAuthXml(): string {
  const config = getGlsConfig();
  const ns = "http://schemas.datacontract.org/2004/07/GLS.MyGLS.ServiceData.APIDTOs.Common";
  return `
    <Username xmlns="${ns}">${escapeXml(config.username)}</Username>
    <Password xmlns="${ns}">${escapeXml(config.passwordHash)}</Password>
    <ClientNumber>${config.clientNumber}</ClientNumber>`;
}

// ── XML helpers (exported for API method files) ──────────────────

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function extractXmlValue(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(regex);
  return m ? m[1].trim() : undefined;
}

export function extractXmlValues(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    results.push(m[1].trim());
  }
  return results;
}

export function extractXmlBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "gi",
  );
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function parseXmlToJson(xml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const arrayPatterns = [
    "ParcelInfo",
    "StatusInfo",
    "DeliveryPoint",
    "DeleteInfo",
    "ParcelStatusInfo",
  ];

  for (const tag of arrayPatterns) {
    const matches = extractXmlBlocks(xml, tag);
    if (matches.length > 0) {
      result[tag] = matches.map(parseXmlToJson);
    }
  }

  const childRegex =
    /<([a-zA-Z0-9_]+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;

  while ((m = childRegex.exec(xml)) !== null) {
    const tagName = m[1];
    const innerXml = m[2];

    if (arrayPatterns.includes(tagName)) continue;

    if (/<[a-zA-Z0-9_]/.test(innerXml)) {
      result[tagName] = parseXmlToJson(innerXml);
    } else {
      const val = innerXml.trim();
      if (/^-?\d+(\.\d+)?$/.test(val) && val.length < 20) {
        result[tagName] = Number(val);
      } else if (val === "true" || val === "false") {
        result[tagName] = val === "true";
      } else {
        result[tagName] = val;
      }
    }
  }

  return result;
}

// ── Config check ─────────────────────────────────────────────────

/** Check whether GLS is properly configured (env vars present). */
export function isGlsConfigured(): boolean {
  try {
    getGlsConfig();
    return true;
  } catch {
    return false;
  }
}
