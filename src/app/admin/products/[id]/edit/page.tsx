import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";

export default async function AdminEditProductPage() {
  await auth(); if (!(await auth())?.user) redirect("/admin/login");
  return <Card className="p-8 text-center text-slate-500">Uređivanje proizvoda — uskoro.</Card>;
}
