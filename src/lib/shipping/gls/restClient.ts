// GLS REST JSON client — replaces SOAP transport.
import "server-only";
import { getGlsConfig, GlsError } from "./config";
// Types from ./types used for response shapes only

const BASE = () => {
  const c = getGlsConfig();
  return c.apiBaseUrl.replace(/\/$/, "");
};

export function glsAuthPayload() {
  const config = getGlsConfig();
  return {
    Username: config.username,
    Password: Array.from(
      new Uint8Array(
        Buffer.from(config.passwordHash, "base64")
      )
    ),
    ClientNumber: config.clientNumber,
  };
}

async function glsRestCall<T>(
  service: string,
  method: string,
  body: Record<string, unknown>,
): Promise<T> {
  const url = `${BASE()}/${service}.svc/json/${method}`;
  const payload = { ...body, ...glsAuthPayload() };

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new GlsError(
      `GLS REST poziv nije uspio — mrežna greška: ${(err as Error).message}`,
      "NETWORK_ERROR",
    );
  }

  const text = await response.text();
  let data: any;
  try { data = JSON.parse(text); } catch {}

  if (!response.ok) {
    throw new GlsError(
      `GLS REST HTTP ${response.status}: ${text.slice(0, 200)}`,
      "HTTP_ERROR",
      response.status,
    );
  }

  return data as T;
}

function checkGlsErrors(
  errors: Array<{ ErrorCode: string; ErrorDescription: string }> | undefined,
  context: string,
): void {
  if (errors && errors.length > 0) {
    const msg = errors
      .map((e) => `${e.ErrorCode}: ${e.ErrorDescription}`)
      .join("; ");
    throw new GlsError(
      `GLS greška (${context}): ${msg}`,
      "API_ERROR",
    );
  }
}

// ── PrepareLabels ─────────────────────────────────────────────

export async function prepareLabels(
  parcels: Array<Record<string, unknown>>,
): Promise<
  Array<{ parcelId: number; parcelNumber: string }>
> {
  const result = await glsRestCall<any>(
    "ParcelService",
    "PrepareLabels",
    { ParcelList: parcels },
  );

  checkGlsErrors(result.PrepareLabelsError, "PrepareLabels");

  return (result.ParcelInfoList || []).map((p: any) => ({
    parcelId: p.ParcelId,
    parcelNumber: p.ParcelNumber,
  }));
}

// ── GetParcelStatuses ────────────────────────────────────────

export async function getParcelStatuses(
  parcelNumbers: string[],
): Promise<Array<{
  parcelNumber: string;
  statusCode: string;
  statusDescription: string;
  timestamp: string;
}>> {
  const result = await glsRestCall<any>(
    "ParcelService",
    "GetParcelStatuses",
    { ParcelNumber: parcelNumbers[0], ReturnPOD: true },
  );

  return (result.ParcelStatusList || []).map((s: any) => ({
    parcelNumber: s.ParcelNumber,
    statusCode: s.StatusCode,
    statusDescription: s.StatusDescription,
    timestamp: s.StatusTimestamp,
  }));
}

// ── DeleteLabels ─────────────────────────────────────────────

export async function cancelLabels(
  parcelIds: number[],
): Promise<Array<{ parcelId: number; success: boolean }>> {
  const result = await glsRestCall<any>(
    "ParcelService",
    "DeleteLabels",
    { ParcelIdList: parcelIds },
  );

  return (result.DeleteLabelsResult?.DeletedList || []).map((d: any) => ({
    parcelId: d.ParcelId,
    success: true,
  }));
}

// ── Delivery Points ──────────────────────────────────────────

export async function getDeliveryPoints(params?: {
  city?: string;
  postalCode?: string;
  countryCode?: string;
}): Promise<Array<{
  Id: string;
  Name: string;
  Address: string;
  City: string;
  ZipCode: string;
}>> {
  const body: Record<string, unknown> = {
    CountryCode: params?.countryCode || "HR",
  };
  if (params?.city) body.City = params.city;
  if (params?.postalCode) body.ZipCode = params.postalCode;

  const result = await glsRestCall<any>(
    "MasterDataService",
    "GetDeliveryPoints",
    body,
  );

  return result.DeliveryPoints || [];
}
