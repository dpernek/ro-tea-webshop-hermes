import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { PlaceholderPage } from "@/components/admin/PlaceholderPage";
export default async function Page() { const s = await auth(); if (!s?.user) redirect("/admin/login"); return <PlaceholderPage slug="coupons" />; }
