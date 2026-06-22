import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";

const T: Record<string, string> = {
  orders: "Narudžbe",
  "orders/[id]": "Detalji narudžbe",
  customers: "Kupci",
  payments: "Plaćanja",
  shipping: "Dostava",
  coupons: "Kuponi",
};

export function PlaceholderPage({ slug }: { slug: string }) {
  return <div><h1 className="mb-6 text-2xl font-bold text-slate-900">{T[slug] || slug}</h1><Card className="p-8 text-center text-slate-500">{T[slug] || slug} — uskoro.</Card></div>;
}

// Reusable server component wrapper
export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const s = await auth();
  if (!s?.user) redirect("/admin/login");
  return <>{children}</>;
}
