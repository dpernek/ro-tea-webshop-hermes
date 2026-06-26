"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPermissions } from "@/lib/permissions";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  Building2,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  TicketPercent,
  FileText, History,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Proizvodi", icon: ShoppingBag },
  { href: "/admin/categories", label: "Kategorije", icon: Tags },
  { href: "/admin/brands", label: "Brendovi", icon: Building2 },
  { href: "/admin/orders", label: "Narudžbe", icon: ShoppingCart },
  { href: "/admin/customers", label: "Kupci", icon: Users },
  { href: "/admin/korisnici", label: "Korisnici", icon: Users },
  { href: "/admin/payments", label: "Plaćanja", icon: CreditCard },
  { href: "/admin/shipping", label: "Dostava", icon: Truck },
  { href: "/admin/coupons", label: "Kuponi", icon: TicketPercent },
  { href: "/admin/katalozi", label: "Katalozi", icon: FileText },
  { href: "/admin/settings", label: "Postavke", icon: Settings },
  { href: "/admin/audit-log", label: "Audit", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const allowed = getPermissions((session?.user as any)?.role || "");
  const navItems = allNavItems.filter(i => allowed.some(p => i.href.includes(p) || (i.href === "/admin" && p === "dashboard")));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide on login page
  if (pathname === "/admin/login") return null;

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 lg:relative lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0055a8] text-sm font-bold text-white">
            RT
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">RO-TEA</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4" onClick={() => setMobileOpen(false)}>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-[#0055a8]/10 text-[#0055a8]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <p className="truncate text-xs font-medium text-slate-800">{session?.user?.name || "Admin"}</p>
            <p className="truncate text-xs text-slate-500">{session?.user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" />
            Odjava
          </button>
        </div>
      </aside>
    </>
  );
}
