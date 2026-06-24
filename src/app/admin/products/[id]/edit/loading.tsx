import { Loader2 } from "lucide-react";

export default function EditProductLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-[#0055a8]" />
      <p className="text-sm text-slate-500">Učitavanje proizvoda...</p>
    </div>
  );
}
