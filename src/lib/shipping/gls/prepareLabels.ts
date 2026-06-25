// GLS PrepareLabels — creates a shipment and returns labels (PDF base64).
import { glsSoapCall, glsAuthXml } from "./client";
import type {
  PrepareLabelsRequest,
  PrepareLabelsResponse,
  GlsParcelInfo,
} from "./types";
import { GlsError } from "./config";

function buildPrepareLabelsXml(params: PrepareLabelsRequest): string {
  const parcelsXml = params.Parcels.map((p) => buildParcelXml(p)).join("\n");

  const printXml = params.PrintParams
    ? `
    <tem:PrintParams>
      <tem:Type>${params.PrintParams.Type}</tem:Type>
      <tem:Format>${params.PrintParams.Format}</tem:Format>
      ${params.PrintParams.ShowLogo !== undefined ? `<tem:ShowLogo>${params.PrintParams.ShowLogo}</tem:ShowLogo>` : ""}
      ${params.PrintParams.PrintPosition ? `<tem:PrintPosition>${params.PrintParams.PrintPosition}</tem:PrintPosition>` : ""}
    </tem:PrintParams>`
    : "";

  return `
<tem:PrepareLabels>
  <tem:request>
    ${glsAuthXml()}
    <tem:Parcels>
      ${parcelsXml}
    </tem:Parcels>
    ${printXml}
  </tem:request>
</tem:PrepareLabels>`;
}

function buildParcelXml(parcel: GlsParcelInfo): string {
  return `
<tem:ParcelInfo>
  ${parcel.ClientReference ? `<tem:ClientReference>${parcel.ClientReference}</tem:ClientReference>` : ""}
  ${parcel.CODAmount !== undefined ? `<tem:CODAmount>${parcel.CODAmount}</tem:CODAmount>` : ""}
  ${parcel.CODReference ? `<tem:CODReference>${parcel.CODReference}</tem:CODReference>` : ""}
  ${parcel.Content ? `<tem:Content>${parcel.Content}</tem:Content>` : ""}
  ${parcel.Count ? `<tem:Count>${parcel.Count}</tem:Count>` : ""}
  <tem:DeliveryAddress>
    <tem:Name>${parcel.DeliveryAddress.Name}</tem:Name>
    <tem:Street>${parcel.DeliveryAddress.Street}</tem:Street>
    ${parcel.DeliveryAddress.HouseNumber ? `<tem:HouseNumber>${parcel.DeliveryAddress.HouseNumber}</tem:HouseNumber>` : ""}
    <tem:City>${parcel.DeliveryAddress.City}</tem:City>
    <tem:ZipCode>${parcel.DeliveryAddress.ZipCode}</tem:ZipCode>
    <tem:CountryCode>${parcel.DeliveryAddress.CountryCode}</tem:CountryCode>
    ${parcel.DeliveryAddress.ContactName ? `<tem:ContactName>${parcel.DeliveryAddress.ContactName}</tem:ContactName>` : ""}
    ${parcel.DeliveryAddress.ContactPhone ? `<tem:ContactPhone>${parcel.DeliveryAddress.ContactPhone}</tem:ContactPhone>` : ""}
    ${parcel.DeliveryAddress.ContactEmail ? `<tem:ContactEmail>${parcel.DeliveryAddress.ContactEmail}</tem:ContactEmail>` : ""}
  </tem:DeliveryAddress>
  ${parcel.PickupAddress ? `
  <tem:PickupAddress>
    <tem:Name>${parcel.PickupAddress.Name}</tem:Name>
    <tem:Street>${parcel.PickupAddress.Street}</tem:Street>
    <tem:City>${parcel.PickupAddress.City}</tem:City>
    <tem:ZipCode>${parcel.PickupAddress.ZipCode}</tem:ZipCode>
    <tem:CountryCode>${parcel.PickupAddress.CountryCode}</tem:CountryCode>
  </tem:PickupAddress>` : ""}
  ${parcel.PickupDate ? `<tem:PickupDate>${parcel.PickupDate}</tem:PickupDate>` : ""}
  ${parcel.Service ? `
  <tem:Service>
    <tem:Code>${parcel.Service.Code}</tem:Code>
    ${parcel.Service.Info ? `<tem:Info>${parcel.Service.Info}</tem:Info>` : ""}
    ${parcel.Service.Parameter?.map((p) => `
    <tem:Parameter>
      <tem:Code>${p.Code}</tem:Code>
      <tem:Value>${p.Value}</tem:Value>
    </tem:Parameter>`).join("") ?? ""}
  </tem:Service>` : ""}
  ${parcel.Weight ? `<tem:Weight>${parcel.Weight}</tem:Weight>` : ""}
</tem:ParcelInfo>`;
}

/**
 * PrepareLabels — creates a GLS shipment and returns ParcelId, ParcelNumber, and labels (PDF base64).
 *
 * Returns an array of { parcelId, parcelNumber, labelBase64 } for each parcel in the request.
 */
export async function prepareLabels(
  parcels: GlsParcelInfo[],
  printParams?: PrepareLabelsRequest["PrintParams"],
): Promise<
  {
    parcelId: number;
    parcelNumber: string;
    clientReference?: string;
  }[]
> {
  if (!parcels.length) {
    throw new GlsError(
      "PrepareLabels zahtijeva barem jedan paket.",
      "NO_PARCELS",
    );
  }

  const request: PrepareLabelsRequest = {
    Username: "", // filled by glsAuthXml
    Password: "",
    ClientNumber: 0,
    Parcels: parcels,
    PrintParams: printParams ?? { Type: "PDF", Format: "A6", ShowLogo: true },
  };

  const bodyXml = buildPrepareLabelsXml(request);
  const response = await glsSoapCall<PrepareLabelsResponse>(
    "PrepareLabels",
    bodyXml,
  );

  const result = response?.PrepareLabelsResult;
  if (!result) {
    throw new GlsError(
      "GLS nije vratio rezultat za PrepareLabels.",
      "NO_RESULT",
    );
  }

  if (result.ErrorInfo?.ErrorCode) {
    throw new GlsError(
      `GLS PrepareLabels greška [${result.ErrorInfo.ErrorCode}]: ${result.ErrorInfo.ErrorDescription}`,
      result.ErrorInfo.ErrorCode,
    );
  }

  const parcelInfos = result.ParcelInfoList?.ParcelInfo ?? [];

  return parcelInfos.map((info) => {
    if (info.ErrorInfo?.ErrorCode) {
      throw new GlsError(
        `GLS greška za paket [${info.ErrorInfo.ErrorCode}]: ${info.ErrorInfo.ErrorDescription}`,
        info.ErrorInfo.ErrorCode,
      );
    }

    return {
      parcelId: info.ParcelId,
      parcelNumber: info.ParcelNumber,
      clientReference: info.ClientReference,
    };
  });
}

/**
 * PrepareLabelsWithLabels — same as prepareLabels but also returns the base64 PDF labels string.
 */
export async function prepareLabelsWithLabels(
  parcels: GlsParcelInfo[],
  printParams?: PrepareLabelsRequest["PrintParams"],
): Promise<{
  parcels: { parcelId: number; parcelNumber: string; clientReference?: string }[];
  labelsBase64: string | undefined;
}> {
  if (!parcels.length) {
    throw new GlsError(
      "PrepareLabels zahtijeva barem jedan paket.",
      "NO_PARCELS",
    );
  }

  const request: PrepareLabelsRequest = {
    Username: "",
    Password: "",
    ClientNumber: 0,
    Parcels: parcels,
    PrintParams: printParams ?? { Type: "PDF", Format: "A6", ShowLogo: true },
  };

  const bodyXml = buildPrepareLabelsXml(request);
  const response = await glsSoapCall<PrepareLabelsResponse>(
    "PrepareLabels",
    bodyXml,
  );

  const result = response?.PrepareLabelsResult;
  if (!result) {
    throw new GlsError(
      "GLS nije vratio rezultat za PrepareLabels.",
      "NO_RESULT",
    );
  }

  if (result.ErrorInfo?.ErrorCode) {
    throw new GlsError(
      `GLS PrepareLabels greška [${result.ErrorInfo.ErrorCode}]: ${result.ErrorInfo.ErrorDescription}`,
      result.ErrorInfo.ErrorCode,
    );
  }

  const parcelInfos = result.ParcelInfoList?.ParcelInfo ?? [];

  const parcelResults = parcelInfos.map((info) => {
    if (info.ErrorInfo?.ErrorCode) {
      throw new GlsError(
        `GLS greška za paket [${info.ErrorInfo.ErrorCode}]: ${info.ErrorInfo.ErrorDescription}`,
        info.ErrorInfo.ErrorCode,
      );
    }

    return {
      parcelId: info.ParcelId,
      parcelNumber: info.ParcelNumber,
      clientReference: info.ClientReference,
    };
  });

  return {
    parcels: parcelResults,
    labelsBase64: result.PrintLabels,
  };
}
