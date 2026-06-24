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
    { href: "/povrati-i-reklamacije", label: "Povrat i zamjena" },
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
