"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "rotea_cookie_consent";

type Consent = "accepted" | "rejected" | null;

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
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
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="border-t border-slate-200 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Content */}
            <div className="flex items-start gap-3 sm:items-center">
              <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8] sm:mt-0" />
              <div>
                <p className="text-sm leading-relaxed text-slate-700">
                  Koristimo kolačiće (cookies) za poboljšanje korisničkog
                  iskustva, analitiku posjećenosti i funkcionalnost košarice.{" "}
                  <Link
                    href="/politika-privatnosti"
                    className="font-medium text-[#0055a8] underline underline-offset-2 transition-colors hover:text-[#0070cc]"
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
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Odbij
              </button>
              <button
                onClick={handleAccept}
                className="cursor-pointer rounded-lg bg-[#0055a8] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0070cc]"
              >
                Prihvati
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
