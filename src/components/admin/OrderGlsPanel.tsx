"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Package,
  Truck,
  MapPin,
  FileText,
  Download,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface GlsStatusInfo {
  StatusCode: string;
  StatusDescription: string;
  StatusDate: string;
  DepotCode?: string;
  DepotName?: string;
}

interface OrderGlsPanelProps {
  orderId: string;
  order: {
    glsShipmentId?: number | null;
    glsParcelNumber?: string | null;
    glsLabelData?: string | null;
    glsStatusData?: string | null;
    glsCreatedAt?: string | null;
    shippingMethod?: string | null;
    shippingAddress?: string | null;
  };
  readonly testMode?: boolean;
}

function parseGlsStatus(glsStatusData?: string | null): {
  status: string;
  updatedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  statusList?: GlsStatusInfo[];
} | null {
  if (!glsStatusData) return null;
  try {
    return JSON.parse(glsStatusData);
  } catch {
    return null;
  }
}

export default function OrderGlsPanel({ orderId, order, testMode }: OrderGlsPanelProps) {
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [localStatus, setLocalStatus] = useState(() => parseGlsStatus(order.glsStatusData));

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 8000);
  };

  const handleCreate = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/gls/create`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.error || "Greška pri kreiranju GLS pošiljke.");
        return;
      }
      showMessage("success", `GLS pošiljka uspješno kreirana! Broj za praćenje: ${data.parcelNumber}`);
      // Force page reload to get updated order data
      window.location.reload();
    } catch {
      showMessage("error", "Greška pri kreiranju GLS pošiljke.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusRefresh = async () => {
    setRefreshing(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/gls/status`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.error || "Greška pri osvježavanju GLS statusa.");
        return;
      }
      setLocalStatus({ status: "REFRESHED", statusList: data.statuses, updatedAt: new Date().toISOString() });
      showMessage("success", "GLS status osvježen.");
    } catch {
      showMessage("error", "Greška pri osvježavanju GLS statusa.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Jeste li sigurni da želite stornirati GLS naljepnicu? Ova radnja se ne može poništiti u GLS sustavu.")) {
      return;
    }
    setCancelling(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/gls/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.error || "Greška pri storniranju GLS naljepnice.");
        return;
      }
      setLocalStatus({ status: "CANCELLED", cancelledAt: new Date().toISOString() });
      showMessage("success", "GLS naljepnica je uspješno stornirana.");
      window.location.reload();
    } catch {
      showMessage("error", "Greška pri storniranju GLS naljepnice.");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadLabel = async () => {
    setDownloading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/gls/label`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Greška pri preuzimanju naljepnice." }));
        showMessage("error", data.error || "Greška pri preuzimanju naljepnice.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GLS-naljepnica.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showMessage("error", "Greška pri preuzimanju naljepnice.");
    } finally {
      setDownloading(false);
    }
  };

  const hasShipment = !!order.glsShipmentId;
  const hasLabel = !!order.glsLabelData;
  const hasTracking = !!order.glsParcelNumber;
  const isCancelled = localStatus?.status === "CANCELLED";

  // Determine shipping type label
  const shippingType = order.shippingMethod || "Nepoznato";

  // Latest status description
  const latestStatus = localStatus?.statusList?.[0];
  const statusText = isCancelled
    ? "Stornirano"
    : latestStatus
      ? `${latestStatus.StatusDescription} (${latestStatus.StatusCode})`
      : hasShipment
        ? "Kreirano"
        : "Nije kreirano";

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">GLS Dostava</h2>
        {testMode && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3 w-3" />
            TEST MODE
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Shipping info */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="mb-0.5 text-xs text-slate-500">Vrsta dostave</div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
              <Truck className="h-4 w-4 text-slate-400" />
              {shippingType}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <div className="mb-0.5 text-xs text-slate-500">Adresa dostave</div>
              <div className="flex items-start gap-1.5 text-sm font-medium text-slate-800">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          )}
        </div>

        {/* Shipment status */}
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <div className="mb-0.5 text-xs text-slate-500">Status GLS pošiljke</div>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {hasShipment && !isCancelled ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : isCancelled ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Package className="h-4 w-4 text-slate-400" />
            )}
            <span
              className={
                isCancelled
                  ? "text-red-700"
                  : hasShipment
                    ? "text-emerald-700"
                    : "text-slate-500"
              }
            >
              {statusText}
            </span>
          </div>
          {latestStatus?.StatusDate && (
            <div className="mt-0.5 text-xs text-slate-500">
              {new Date(latestStatus.StatusDate).toLocaleString("hr-HR")}
            </div>
          )}
        </div>

        {/* Tracking number */}
        {hasTracking && (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="mb-0.5 text-xs text-slate-500">Broj za praćenje</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-slate-800">
                {order.glsParcelNumber}
              </span>
              {order.glsParcelNumber && (
                <a
                  href={`https://gls-group.eu/HR/hr/pracenje-posiljke?match=${order.glsParcelNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0055a8] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Prati online
                </a>
              )}
            </div>
          </div>
        )}

        {/* Status timeline */}
        {localStatus?.statusList && localStatus.statusList.length > 0 && (
          <div className="rounded-lg border border-slate-200 px-3 py-2">
            <div className="mb-2 text-xs font-medium text-slate-500">Povijest statusa</div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {localStatus.statusList.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                  <div>
                    <span className="font-medium text-slate-700">{s.StatusDescription}</span>
                    {s.DepotName && (
                      <span className="text-slate-400"> — {s.DepotName}</span>
                    )}
                    <div className="text-slate-400">
                      {new Date(s.StatusDate).toLocaleString("hr-HR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GLS tracking link */}
        {hasTracking && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-sm">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <a
                href={`https://gls-group.eu/HR/hr/pracenje-posiljke?match=${order.glsParcelNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0055a8] hover:underline"
              >
                Prati pošiljku na GLS webu
              </a>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {!hasShipment && !isCancelled && (
            <Button
              onClick={handleCreate}
              disabled={creating}
              isLoading={creating}
              className="w-full"
              variant="outline"
            >
              {creating ? "Kreiranje..." : "Kreiraj GLS test pošiljku"}
            </Button>
          )}

          {hasShipment && !isCancelled && (
            <>
              <Button
                onClick={handleStatusRefresh}
                disabled={refreshing}
                isLoading={refreshing}
                className="w-full"
                variant="outline"
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {refreshing ? "Osvježavanje..." : "Osvježi GLS status"}
              </Button>

              {hasLabel && (
                <Button
                  onClick={handleDownloadLabel}
                  disabled={downloading}
                  isLoading={downloading}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? "Preuzimanje..." : "Preuzmi GLS naljepnicu"}
                </Button>
              )}

              <Button
                onClick={handleCancel}
                disabled={cancelling}
                isLoading={cancelling}
                className="w-full"
                variant="ghost"
                size="sm"
              >
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                {cancelling ? "Storniranje..." : "Storniraj GLS naljepnicu"}
              </Button>
            </>
          )}

          {isCancelled && !hasShipment && (
            <Button
              onClick={handleCreate}
              disabled={creating}
              isLoading={creating}
              className="w-full"
              variant="outline"
            >
              {creating ? "Kreiranje..." : "Ponovno kreiraj GLS pošiljku"}
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              message.type === "error"
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Not configured warning */}
        {!hasShipment && !isCancelled && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              GLS podaci se spremaju na narudžbu nakon kreiranja. Provjerite da su GLS
              vjerodajnice ispravno postavljene u .env datoteci.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
