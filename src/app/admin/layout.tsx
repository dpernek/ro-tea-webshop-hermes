"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-slate-100">
        {!isLogin && <AdminSidebar />}
        <main className={`flex-1 overflow-y-auto ${isLogin ? "" : "p-6 lg:p-8"}`}>{children}</main>
      </div>
    </SessionProvider>
  );
}
