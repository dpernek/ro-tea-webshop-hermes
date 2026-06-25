// GLS GetParcelStatuses — retrieves status for one or more parcels by ParcelNumber.
import { glsSoapCall, glsAuthXml } from "./client";
import type {
  GetParcelStatusesResponse,
  GlsParcelStatusInfo,
  GlsStatusInfo,
} from "./types";
import { GlsError } from "./config";

export interface ParcelStatusResult {
  parcelNumber: string;
  statuses: {
    statusCode: string;
    statusDescription: string;
    statusDate: string;
    depotCode?: string;
    depotName?: string;
  }[];
}

function buildGetParcelStatusesXml(
  parcelNumbers: string[],
  language?: string,
): string {
  const parcelNumsXml = parcelNumbers
    .map((num) => `<tem:string>${num}</tem:string>`)
    .join("\n");

  return `
<tem:GetParcelStatuses>
  <tem:request>
    ${glsAuthXml()}
    <tem:ParcelNumbers>
      ${parcelNumsXml}
    </tem:ParcelNumbers>
    ${language ? `<tem:Language>${language}</tem:Language>` : ""}
  </tem:request>
</tem:GetParcelStatuses>`;
}

/**
 * GetParcelStatuses — retrieves status for one or more parcels by ParcelNumber.
 *
 * @param parcelNumbers — array of GLS parcel numbers (e.g. "1234567890")
 * @param language — language for status descriptions, e.g. "HR" (default: Croatian)
 * @returns array of parcel status results
 */
export async function getParcelStatuses(
  parcelNumbers: string[],
  language?: string,
): Promise<ParcelStatusResult[]> {
  if (!parcelNumbers.length) {
    throw new GlsError(
      "GetParcelStatuses zahtijeva barem jedan broj paketa.",
      "NO_PARCEL_NUMBERS",
    );
  }

  const bodyXml = buildGetParcelStatusesXml(parcelNumbers, language ?? "HR");
  const response = await glsSoapCall<GetParcelStatusesResponse>(
    "GetParcelStatuses",
    bodyXml,
  );

  const result = response?.GetParcelStatusesResult;
  if (!result) {
    throw new GlsError(
      "GLS nije vratio rezultat za GetParcelStatuses.",
      "NO_RESULT",
    );
  }

  if (result.ErrorInfo?.ErrorCode) {
    throw new GlsError(
      `GLS GetParcelStatuses greška [${result.ErrorInfo.ErrorCode}]: ${result.ErrorInfo.ErrorDescription}`,
      result.ErrorInfo.ErrorCode,
    );
  }

  const parcelStatusList = result.ParcelStatusList?.ParcelStatusInfo ?? [];

  return parcelStatusList.map((info) => {
    if (info.ErrorInfo?.ErrorCode) {
      throw new GlsError(
        `GLS greška za paket ${info.ParcelNumber} [${info.ErrorInfo.ErrorCode}]: ${info.ErrorInfo.ErrorDescription}`,
        info.ErrorInfo.ErrorCode,
      );
    }

    const statuses = (info.StatusInfoList?.StatusInfo ?? []).map((s) => ({
      statusCode: s.StatusCode,
      statusDescription: s.StatusDescription,
      statusDate: s.StatusDate,
      depotCode: s.DepotCode,
      depotName: s.DepotName,
    }));

    return {
      parcelNumber: info.ParcelNumber,
      statuses,
    };
  });
}

/**
 * GetParcelStatus — convenience wrapper for a single parcel number.
 */
export async function getParcelStatus(
  parcelNumber: string,
  language?: string,
): Promise<ParcelStatusResult> {
  const results = await getParcelStatuses([parcelNumber], language);
  if (!results.length) {
    throw new GlsError(
      `GLS nije vratio status za paket ${parcelNumber}.`,
      "NO_STATUS",
    );
  }
  return results[0];
}

// ── Status code lookup — Croatian descriptions ──────────────────

export const GLS_STATUS_CODES: Record<string, string> = {
  "1.0": "Paket zaprimljen u GLS sustavu",
  "1.1": "Paket zaprimljen — nema fizičkog skeniranja",
  "1.3": "Paket zaprimljen uz provjeru adrese",
  "2.0": "Paket u tranzitu",
  "2.1": "Paket stigao u skladište",
  "2.2": "Paket napustio skladište",
  "2.3": "Paket u dostavi",
  "2.4": "Paket zadržan u skladištu",
  "2.5": "Paket preusmjeren",
  "2.9": "Paket u carinskom postupku",
  "3.0": "Paket dostavljen",
  "3.1": "Paket dostavljen primatelju",
  "3.2": "Paket dostavljen na paketomat",
  "3.3": "Paket dostavljen u parcel shop",
  "4.0": "Problem s dostavom",
  "4.1": "Primatelj odsutan",
  "4.2": "Adresa nepotpuna/netočna",
  "4.3": "Primatelj odbio paket",
  "4.4": "Paket oštećen",
  "4.9": "Ostali problemi s dostavom",
  "5.0": "Paket vraćen pošiljatelju",
  "5.1": "Paket vraćen — isteklo vrijeme preuzimanja",
  "6.0": "Paket uništen",
  "9.0": "Obavijest — informativni status",
};

export function getStatusDescription(statusCode: string): string {
  return GLS_STATUS_CODES[statusCode] ?? `Nepoznat status (${statusCode})`;
}
