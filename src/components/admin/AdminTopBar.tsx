"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

export function AdminTopBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide on login page
  if (pathname === "/admin/login") return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Mobile menu trigger — sidebar handles its own toggle, this is a visual hint */}
      <div className="flex items-center gap-3 lg:hidden">
        <Menu className="h-5 w-5 text-slate-500" />
      </div>

      {/* Logo */}
      <Link
        href="/admin"
        className="flex items-center gap-2 font-semibold text-slate-900"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0055a8] text-xs font-bold text-white">
          RT
        </div>
        <span className="text-sm">RO-TEA Admin</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {session?.user?.email && (
          <span className="hidden text-xs text-slate-500 sm:inline">
            {session.user.email}
          </span>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Odjava</span>
        </button>
      </div>
    </header>
  );
}
