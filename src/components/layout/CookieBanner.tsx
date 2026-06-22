"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

const STORAGE_KEY = "rotea_cookie_consent";

type Consent = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it animates in
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
    setConsent(stored as Consent);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
    setVisible(false);
  };

  // Don't render if consent already given
  if (consent) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleReject}
      />

      {/* Banner */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[101] transition-all duration-500 ease-out ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Content */}
              <div className="flex items-start gap-3 sm:items-center">
                <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8] sm:mt-0" />
                <div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Ova web stranica koristi kolačiće (cookies) za poboljšanje
                    korisničkog iskustva, analitiku posjećenosti i
                    funkcionalnost košarice.{" "}
                    <Link
                      href="/politika-privatnosti"
                      className="font-medium text-[#0055a8] underline underline-offset-2 hover:text-[#0070cc]"
                    >
                      Više informacija
                    </Link>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={handleReject}
                  className="cursor-pointer rounded-lg border border-slate-600 px-5 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                >
                  Odbij
                </button>
                <button
                  onClick={handleAccept}
                  className="cursor-pointer rounded-lg bg-[#0055a8] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0070cc]"
                >
                  Prihvati
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
