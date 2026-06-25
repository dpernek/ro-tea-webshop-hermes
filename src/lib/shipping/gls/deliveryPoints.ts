/* eslint-disable @typescript-eslint/no-unused-vars */
// GLS GetDeliveryPoints — retrieves list of pickup points/lockers.
import { glsSoapCall, glsAuthXml } from "./client";
import type { GetDeliveryPointsResponse, GlsDeliveryPoint } from "./types";
import { getGlsConfig, GlsError } from "./config";

function buildGetDeliveryPointsXml(params: {
  city?: string;
  zipCode?: string;
  language?: string;
}): string {
  const config = getGlsConfig();

  return `
<tem:GetDeliveryPoints>
  <tem:request>
    ${glsAuthXml()}
    ${params.city ? `<tem:City>${params.city}</tem:City>` : ""}
    ${params.zipCode ? `<tem:ZipCode>${params.zipCode}</tem:ZipCode>` : ""}
    <tem:CountryCode>${config.countryCode}</tem:CountryCode>
    ${params.language ? `<tem:Language>${params.language}</tem:Language>` : ""}
  </tem:request>
</tem:GetDeliveryPoints>`;
}

export interface DeliveryPointResult {
  id: number;
  code: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  countryCode: string;
  type: string;
  workingHours?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  maxParcelSize?: string;
  description?: string;
}

/**
 * GetDeliveryPoints — retrieves a list of available GLS pickup points and parcel lockers.
 *
 * @param params.city — optional city filter
 * @param params.zipCode — optional zip code filter
 * @param params.language — language for descriptions, e.g. "HR" (default)
 * @returns array of delivery point results
 */
export async function getDeliveryPoints(params?: {
  city?: string;
  zipCode?: string;
  language?: string;
}): Promise<DeliveryPointResult[]> {
  const bodyXml = buildGetDeliveryPointsXml({
    city: params?.city,
    zipCode: params?.zipCode,
    language: params?.language ?? "HR",
  });

  const response = await glsSoapCall<GetDeliveryPointsResponse>(
    "GetDeliveryPoints",
    bodyXml,
  );

  const result = response?.GetDeliveryPointsResult;
  if (!result) {
    throw new GlsError(
      "GLS nije vratio rezultat za GetDeliveryPoints.",
      "NO_RESULT",
    );
  }

  if (result.ErrorInfo?.ErrorCode) {
    throw new GlsError(
      `GLS GetDeliveryPoints greška [${result.ErrorInfo.ErrorCode}]: ${result.ErrorInfo.ErrorDescription}`,
      result.ErrorInfo.ErrorCode,
    );
  }

  const points = result.DeliveryPointList?.DeliveryPoint ?? [];

  return points.map((dp) => ({
    id: dp.Id,
    code: dp.Code,
    name: dp.Name,
    street: dp.Street,
    city: dp.City,
    zipCode: dp.ZipCode,
    countryCode: dp.CountryCode,
    type: dp.Type,
    workingHours: dp.WorkingHours,
    contactPhone: dp.ContactPhone,
    latitude: dp.Latitude,
    longitude: dp.Longitude,
    maxParcelSize: dp.MaxParcelSize,
    description: dp.Description,
  }));
}

/**
 * GetDeliveryPointsByCity — convenience wrapper filtered by city.
 */
export async function getDeliveryPointsByCity(
  city: string,
  language?: string,
): Promise<DeliveryPointResult[]> {
  return getDeliveryPoints({ city, language });
}

/**
 * GetDeliveryPointsByZipCode — convenience wrapper filtered by zip code.
 */
export async function getDeliveryPointsByZipCode(
  zipCode: string,
  language?: string,
): Promise<DeliveryPointResult[]> {
  return getDeliveryPoints({ zipCode, language });
}

// ── Delivery point type labels (Croatian) ───────────────────────

export const DELIVERY_POINT_TYPE_LABELS: Record<string, string> = {
  PARCEL_SHOP: "Parcel shop",
  PARCEL_LOCKER: "Paketomat",
  PUDO: "Pick-up / Drop-off točka",
};
