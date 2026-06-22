import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";

const title = "Brendovi";
export default async function Page() {
  const s = await auth(); if (!s?.user) redirect("/admin/login");
  return <div><h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1><Card className="p-8 text-center text-slate-500">{title} — uskoro.</Card></div>;
}
