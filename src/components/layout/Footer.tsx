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
              <a href="https://www.facebook.com/roteazagreb/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1877F2] text-white transition-opacity hover:opacity-85" aria-label="Facebook">
                <svg viewBox="0 0 320 512" fill="currentColor" className="h-[18px] w-[11px]"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
              </a>
              <a href="https://www.instagram.com/rotea_zagreb/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E4405F] text-white transition-opacity hover:opacity-85" aria-label="Instagram">
                <svg viewBox="0 0 448 512" fill="currentColor" className="h-[20px] w-[18px]"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/111730137/" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A66C2] text-white transition-opacity hover:opacity-85" aria-label="LinkedIn">
                <svg viewBox="0 0 448 512" fill="currentColor" className="h-[19px] w-[17px]"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>
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
