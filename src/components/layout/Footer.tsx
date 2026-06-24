import Link from "next/link";
import { site } from "@/lib/data";
import { Mail, Phone, MapPin, Truck, CreditCard, RotateCcw, ShieldCheck } from "lucide-react";
import Image from "next/image";

const footerLinks = {
  informacije: [
    { href: "/o-nama", label: "O nama" },
    { href: "/uvjeti-kupnje", label: "Uvjeti kupovine" },
    { href: "/izjava-o-sigurnosti-online-placanja", label: "Sigurnost plaćanja" },
    { href: "/pravila-o-privatnosti", label: "Pravila o privatnosti" },
    { href: "/proizvodi", label: "Trgovina" },
  ],
  podrska: [
    { href: "/kontakt", label: "Kontakt" },
    { href: "/jednostrani-raskid-ugovora", label: "Raskid ugovora" },
    { href: "/pravila-povrata-i-zamjene", label: "Povrat i zamjena" },
    { href: "/pravila-dostave", label: "Dostava" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/images/rotea-logo.webp"
                alt="RO-TEA"
                width={156}
                height={24}
                className="h-6 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Profesionalni alati i oprema za industriju, radionice i obrtnike.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://www.facebook.com/roteazagreb/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-[#1877F2] hover:text-white" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/rotea_zagreb/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-[#E4405F] hover:text-white" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 0C8.74 0 8.333.015 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/111730137/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-[#0A66C2] hover:text-white" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Informacije
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.informacije.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand text-sm text-slate-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Podrška
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.podrska.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand text-sm text-slate-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              RO-TEA d.o.o.
            </h4>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <span>{site.contact.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Phone className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={`tel:${site.contact.phoneDisplay.replace(/\s/g, "")}`}
                  className="hover:text-brand"
                >
                  {site.contact.phoneDisplay}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <Mail className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="hover:text-brand"
                >
                  {site.contact.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Trust blocks: Shipping / Payment / Returns / Warranty */}
        <div className="mt-12 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Dostava</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                6,64 €. Besplatna dostava za narudžbe iznad 66,36 €.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Plaćanje</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Bankovna uplata, pouzeće i kartično plaćanje.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Povrat</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                14 dana pravo na povrat bez navođenja razloga.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Jamstvo</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Jamstvo na sve proizvode sukladno zakonskim propisima.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {site.contact.company}. Sva prava
              pridržana.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
              <span>OIB: {site.contact.oib}</span>
              {site.contact.iban && <span>IBAN: {site.contact.iban}</span>}
              <Link href="/pravila-o-privatnosti" className="hover:text-brand">
                Pravila privatnosti
              </Link>
              <Link href="/uvjeti-kupnje" className="hover:text-brand">
                Uvjeti kupovine
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
