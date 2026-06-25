// GLS shipping integration — barrel export.
// All modules are server-only; never import client-side.

export { getGlsConfig, resetGlsConfig, GlsError } from "./config";
export type { GlsConfig } from "./config";

export { isGlsConfigured } from "./client";
export {
  glsSoapCall,
  glsAuthXml,
  escapeXml,
  extractXmlValue,
  extractXmlValues,
  extractXmlBlocks,
} from "./client";

export type {
  GlsAddress,
  GlsParcel,
  GlsService,
  GlsServiceParameter,
  PrepareLabelsRequest,
  PrepareLabelsResponse,
  GlsParcelInfo,
  PrintParams,
  GlsPrintLabelsInfo,
  GetParcelStatusesRequest,
  GetParcelStatusesResponse,
  GlsParcelStatusInfo,
  GlsStatusInfo,
  GetDeliveryPointsRequest,
  GetDeliveryPointsResponse,
  GlsDeliveryPoint,
  DeleteLabelsRequest,
  DeleteLabelsResponse,
  GlsDeleteInfo,
  GlsErrorInfo,
} from "./types";

export { prepareLabels } from "./restClient";
export {
  getParcelStatuses,
  getParcelStatus,
  getStatusDescription,
  GLS_STATUS_CODES,
} from "./parcelStatus";
export type { ParcelStatusResult } from "./parcelStatus";

export {
  getDeliveryPoints,
  getDeliveryPointsByCity,
  getDeliveryPointsByZipCode,
  DELIVERY_POINT_TYPE_LABELS,
} from "./deliveryPoints";
export type { DeliveryPointResult } from "./deliveryPoints";

export { deleteLabels, deleteLabel, cancelLabels } from "./deleteLabels";
export type { DeleteLabelResult } from "./deleteLabels";

export { glsAuthPayload } from "./restClient";
