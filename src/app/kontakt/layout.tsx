import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | RO-TEA",
  description:
    "Kontaktirajte RO-TEA — Badalićeva 26b, Zagreb. Telefon: +385 1 3820 113. E-mail: info@ro-tea.hr. Radno vrijeme: Pon-Pet 08:00–16:00, Sub 08:00–12:00.",
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    title: "Kontakt | RO-TEA",
    description:
      "Kontaktirajte RO-TEA — Badalićeva 26b, Zagreb. Telefon: +385 1 3820 113. E-mail: info@ro-tea.hr. Radno vrijeme: Pon-Pet 08:00–16:00, Sub 08:00–12:00.",
    type: "website",
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
