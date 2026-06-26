"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, ShoppingBag, Tags, Building2, ShoppingCart,
  Users, CreditCard, Truck, TicketPercent, FileText, History,
  Settings, Menu, X, LogOut, ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { getPermissions } from "@/lib/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  resource: string;
}

const allNavItems: NavItem[] = [
  { href: "/admin",            label: "Dashboard",    icon: LayoutDashboard, resource: "dashboard" },
  { href: "/admin/products",   label: "Proizvodi",    icon: ShoppingBag,     resource: "products" },
  { href: "/admin/categories", label: "Kategorije",   icon: Tags,           resource: "categories" },
  { href: "/admin/brands",     label: "Brendovi",     icon: Building2,      resource: "brands" },
  { href: "/admin/orders",     label: "Narudžbe",     icon: ShoppingCart,   resource: "orders" },
  { href: "/admin/customers",  label: "Kupci",        icon: Users,          resource: "customers" },
  { href: "/admin/korisnici",  label: "Korisnici",    icon: Users,          resource: "users" },
  { href: "/admin/payments",   label: "Plaćanja",     icon: CreditCard,     resource: "payments" },
  { href: "/admin/shipping",   label: "Dostava",      icon: Truck,          resource: "shipping" },
  { href: "/admin/coupons",    label: "Kuponi",       icon: TicketPercent,  resource: "coupons" },
  { href: "/admin/katalozi",   label: "Katalozi",     icon: FileText,       resource: "catalogs" },
  { href: "/admin/settings",   label: "Postavke",     icon: Settings,       resource: "settings" },
  { href: "/admin/audit-log",  label: "Audit",        icon: History,        resource: "audit_log" },
  { href: "/admin/content",    label: "Sadržaj",      icon: FileText,       resource: "content" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const allowed = getPermissions((session?.user as any)?.role || "");

  const navItems = allNavItems.filter(i => allowed.includes(i.resource));
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
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/admin" className="text-lg font-bold">
            RO-TEA <span className="text-[#0055a8]">Admin</span>
          </Link>
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#0055a8]/10 text-[#0055a8]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Odjava
          </button>
        </div>
      </aside>
    </>
  );
}
