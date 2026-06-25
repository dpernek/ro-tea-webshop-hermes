"use client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface InlineStatusProps {
  loading?: boolean;
  loadingText?: string;
  success?: string;
  error?: string;
}

export function InlineStatus({ loading, loadingText, success, error }: InlineStatusProps) {
  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{loadingText || "Učitavanje..."}</span>
    </div>
  );
  if (error) return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
  if (success) return (
    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      <span>{success}</span>
    </div>
  );
  return null;
}

export function EmptyState({ message, icon }: { message: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <span className="text-3xl">{icon || "📭"}</span>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
