/* eslint-disable @typescript-eslint/no-unused-vars */
// GLS DeleteLabels — cancels labels by ParcelId.
import { glsSoapCall, glsAuthXml } from "./client";
import type { DeleteLabelsResponse, GlsDeleteInfo } from "./types";
import { GlsError } from "./config";

function buildDeleteLabelsXml(parcelIds: number[]): string {
  const idXml = parcelIds
    .map((id) => `<tem:int>${id}</tem:int>`)
    .join("\n");

  return `
<tem:DeleteLabels>
  <tem:request>
    ${glsAuthXml()}
    <tem:ParcelIdList>
      ${idXml}
    </tem:ParcelIdList>
  </tem:request>
</tem:DeleteLabels>`;
}

export interface DeleteLabelResult {
  parcelId: number;
  parcelNumber: string;
  success: boolean;
  errorCode?: string;
  errorDescription?: string;
}

/**
 * DeleteLabels — cancels one or more GLS labels by ParcelId.
 *
 * @param parcelIds — array of GLS parcel IDs to cancel
 * @returns array of results indicating which were successfully cancelled
 */
export async function cancelLabels(
  parcelIds: number[],
): Promise<DeleteLabelResult[]> {
  if (!parcelIds.length) {
    throw new GlsError(
      "DeleteLabels zahtijeva barem jedan ID paketa.",
      "NO_PARCEL_IDS",
    );
  }

  const bodyXml = buildDeleteLabelsXml(parcelIds);
  const response = await glsSoapCall<DeleteLabelsResponse>(
    "DeleteLabels",
    bodyXml,
  );

  const result = response?.DeleteLabelsResult;
  if (!result) {
    throw new GlsError(
      "GLS nije vratio rezultat za DeleteLabels.",
      "NO_RESULT",
    );
  }

  if (result.ErrorInfo?.ErrorCode) {
    throw new GlsError(
      `GLS DeleteLabels greška [${result.ErrorInfo.ErrorCode}]: ${result.ErrorInfo.ErrorDescription}`,
      result.ErrorInfo.ErrorCode,
    );
  }

  const deleteInfos = result.DeleteInfoList?.DeleteInfo ?? [];

  return deleteInfos.map((info) => ({
    parcelId: info.ParcelId,
    parcelNumber: info.ParcelNumber,
    success: info.Success,
    errorCode: info.ErrorInfo?.ErrorCode,
    errorDescription: info.ErrorInfo?.ErrorDescription,
  }));
}

/**
 * DeleteLabel — convenience wrapper for a single ParcelId.
 */
export async function deleteLabels(
  parcelIds: number[],
): Promise<DeleteLabelResult[]> {
  return cancelLabels(parcelIds);
}

/**
 * DeleteLabel — convenience wrapper for a single ParcelId.
 */
export async function deleteLabel(
  parcelId: number,
): Promise<DeleteLabelResult> {
  const results = await cancelLabels([parcelId]);
  if (!results.length) {
    throw new GlsError(
      `GLS nije vratio rezultat za brisanje paketa ${parcelId}.`,
      "NO_RESULT",
    );
  }
  return results[0];
}
