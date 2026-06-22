"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setVisible(true);
  }, []);

  const accept = (all: boolean) => {
    localStorage.setItem("cookieConsent", all ? "all" : "necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up border-t border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          <p className="font-medium">Kolačići i privatnost</p>
          <p className="mt-1">
            Koristimo nužne kolačiće za funkcioniranje stranice. Vaši podaci su sigurni.
            <Link href="/politika-privatnosti" className="ml-1 text-[#0055a8] underline">
              Pravila privatnosti
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => accept(false)}>
            Samo nužni
          </Button>
          <Button size="sm" onClick={() => accept(true)}>
            Prihvati sve
          </Button>
        </div>
      </div>
    </div>
  );
}
