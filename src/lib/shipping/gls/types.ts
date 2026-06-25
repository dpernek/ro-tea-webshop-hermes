// GLS Croatia API — TypeScript types matching the GLS SOAP contract.
// All types mirror the XML/SOAP schema used by api.test.mygls.hr.

// ── Address ──────────────────────────────────────────────────────

export interface GlsAddress {
  Name: string;
  Street: string;
  HouseNumber?: string;
  City: string;
  ZipCode: string;
  CountryCode: string; // e.g. "HR"
  ContactName?: string;
  ContactPhone?: string;
  ContactEmail?: string;
}

// ── Parcel (package) ─────────────────────────────────────────────

export interface GlsParcel {
  ClientReference?: string; // optional client reference number
  CODAmount?: number; // cash-on-delivery amount
  CODReference?: string;
  Content?: string; // parcel content description
  Count?: number; // number of parcels, usually 1
  PickupDate?: string; // ISO date string
  Weight?: number; // weight in kg
  Service?: GlsService;
}

export interface GlsService {
  Code: string; // e.g. "PSD" for parcel service delivery
  Info?: string;
  Parameter?: GlsServiceParameter[];
}

export interface GlsServiceParameter {
  Code: string;
  Value: string;
}

// ── PrepareLabels ────────────────────────────────────────────────

export interface PrepareLabelsRequest {
  Username: string;
  Password: string; // SHA512 hex digest
  ClientNumber: number;
  Parcels: GlsParcelInfo[];
  PrintParams?: PrintParams;
}

export interface GlsParcelInfo {
  ClientReference?: string;
  CODAmount?: number;
  CODReference?: string;
  Content?: string;
  Count?: number;
  DeliveryAddress: GlsAddress;
  PickupAddress?: GlsAddress;
  PickupDate?: string;
  Service?: GlsService;
  Weight?: number;
  ParcelNumber?: string; // set by GLS on response
}

export interface PrintParams {
  Type: string; // e.g. "PDF", "PNG"
  Format: string; // e.g. "A4", "A6"
  ShowLogo?: boolean;
  PrintPosition?: string;
}

export interface PrepareLabelsResponse {
  PrepareLabelsResult?: {
    ParcelInfoList?: {
      ParcelInfo: GlsPrintLabelsInfo[];
    };
    PrintLabels?: string; // base64 PDF/PNG
    ErrorInfo?: GlsErrorInfo;
  };
}

export interface GlsPrintLabelsInfo {
  ClientReference?: string;
  ParcelId: number;
  ParcelNumber: string;
  ErrorInfo?: GlsErrorInfo;
}

// ── GetParcelStatuses ────────────────────────────────────────────

export interface GetParcelStatusesRequest {
  Username: string;
  Password: string;
  ClientNumber: number;
  ParcelNumbers: string[];
  Language?: string; // e.g. "HR", "EN"
}

export interface GetParcelStatusesResponse {
  GetParcelStatusesResult?: {
    ParcelStatusList?: {
      ParcelStatusInfo: GlsParcelStatusInfo[];
    };
    ErrorInfo?: GlsErrorInfo;
  };
}

export interface GlsParcelStatusInfo {
  ParcelNumber: string;
  StatusInfoList?: {
    StatusInfo: GlsStatusInfo[];
  };
  ErrorInfo?: GlsErrorInfo;
}

export interface GlsStatusInfo {
  StatusCode: string;
  StatusDescription: string;
  StatusDate: string; // ISO datetime
  DepotCode?: string;
  DepotName?: string;
}

// ── GetDeliveryPoints ────────────────────────────────────────────

export interface GetDeliveryPointsRequest {
  Username: string;
  Password: string;
  ClientNumber: number;
  City?: string;
  ZipCode?: string;
  CountryCode: string; // e.g. "HR"
  Language?: string;
}

export interface GetDeliveryPointsResponse {
  GetDeliveryPointsResult?: {
    DeliveryPointList?: {
      DeliveryPoint: GlsDeliveryPoint[];
    };
    ErrorInfo?: GlsErrorInfo;
  };
}

export interface GlsDeliveryPoint {
  Id: number;
  Code: string;
  Name: string;
  Street: string;
  City: string;
  ZipCode: string;
  CountryCode: string;
  Type: string; // "PARCEL_SHOP" | "PARCEL_LOCKER"
  WorkingHours?: string;
  ContactPhone?: string;
  Latitude?: number;
  Longitude?: number;
  MaxParcelSize?: string;
  Description?: string;
}

// ── DeleteLabels ─────────────────────────────────────────────────

export interface DeleteLabelsRequest {
  Username: string;
  Password: string;
  ClientNumber: number;
  ParcelIdList: number[];
}

export interface DeleteLabelsResponse {
  DeleteLabelsResult?: {
    DeleteInfoList?: {
      DeleteInfo: GlsDeleteInfo[];
    };
    ErrorInfo?: GlsErrorInfo;
  };
}

export interface GlsDeleteInfo {
  ParcelId: number;
  ParcelNumber: string;
  Success: boolean;
  ErrorInfo?: GlsErrorInfo;
}

// ── Shared error info ────────────────────────────────────────────

export interface GlsErrorInfo {
  ErrorCode: string;
  ErrorDescription: string;
}
