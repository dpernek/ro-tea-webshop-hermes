import Link from "next/link";
import { site } from "@/lib/data";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  shop: [
    { href: "/proizvodi", label: "Svi proizvodi" },
    { href: "/kategorije/alati", label: "Alati" },
    { href: "/kategorije/rasvjeta", label: "Rasvjeta" },
    { href: "/kategorije/pametna-kuca", label: "Pametna kuća" },
  ],
  company: [
    { href: "/o-nama", label: "O nama" },
    { href: "/kontakt", label: "Kontakt" },
  ],
};

export function Footer() {
  const phoneHref = `tel:${site.contact.phoneDisplay.replace(/\s/g, "")}`;

  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="text-brand text-2xl font-bold">
              {site.name}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {site.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
              Trgovina
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
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
              Tvrtka
            </h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
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
              Kontakt
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Phone className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <a href={phoneHref} className="hover:text-brand">
                  {site.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Mail className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <a
                  href={`mailto:${site.contact.email}`}
                  className="hover:text-brand"
                >
                  {site.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                {site.contact.address}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {site.contact.company}. Sva prava
              pridržana.
            </p>
            <p className="text-sm text-slate-500">OIB: {site.contact.oib}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
