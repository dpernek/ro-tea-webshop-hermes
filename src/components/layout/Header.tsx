"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Menu, X, ShoppingCart, Phone, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/data";
import Image from "next/image";

const navItems = [
  { href: "/proizvodi", label: "Trgovina" },
  { href: "/usluga-brusenja", label: "Usluga brušenja" },
  { href: "/o-nama", label: "O nama" },
  { href: "/katalozi", label: "Katalozi" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const phoneHref = `tel:${site.contact.phoneDisplay.replace(/\s/g, "")}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/rotea-logo.webp"
            alt="RO-TEA"
            width={182}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-hidden={!mobileOpen ? "true" : undefined}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "hover:text-brand text-sm font-medium transition-colors",
                pathname === item.href ? "text-brand" : "text-slate-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={phoneHref}
            className="hover:text-brand hidden items-center gap-1.5 text-sm font-medium text-slate-700 lg:flex"
          >
            <Phone className="h-4 w-4" />
            {site.contact.phoneDisplay}
          </a>
          <Link
            href="/kosarica"
            className="hover:text-brand relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Košarica"
          >
            <Link href="/lista-zelja" className="relative p-1.5 text-slate-600 hover:text-red-500 transition-colors"><Heart className="h-5 w-5" />{wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">{wishlistCount}</span>}</Link>
          <ShoppingCart className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="bg-brand absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
            aria-label="Izbornik"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                  pathname === item.href
                    ? "bg-brand/10 text-brand"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={phoneHref}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              {site.contact.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
