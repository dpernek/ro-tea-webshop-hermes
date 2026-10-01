import { formatPrice } from "@/lib/utils";

export function AnchorPrice({
  cents,
  date,
  unit = false,
}: {
  cents?: number | null;
  date?: string | null;
  unit?: boolean;
}) {
  if (cents == null || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split("-").map(Number);
  return (
    <p className="mt-1 text-xs leading-relaxed text-slate-600">
      {unit ? "Jedinična cijena na " : "Cijena na "}
      {day}. {month}. {year}.:{" "}
      <span className="font-medium">{formatPrice(cents / 100)}</span>
    </p>
  );
}
