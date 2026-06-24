import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt | RO-TEA",
  description:
    "Kontaktirajte RO-TEA — Badalićeva 26b, Zagreb. Telefon: +385 1 3820 113. E-mail: info@ro-tea.hr. Radno vrijeme: Pon-Pet 07:30–15:30.",
  alternates: {
    canonical: "/kontakt",
  },
  openGraph: {
    title: "Kontakt | RO-TEA",
    description:
      "Kontaktirajte RO-TEA — Badalićeva 26b, Zagreb. Telefon: +385 1 3820 113. E-mail: info@ro-tea.hr. Radno vrijeme: Pon-Pet 07:30–15:30.",
    type: "website",
    images: [
      {
        url: "/images/rotea-logo.webp",
        width: 1170,
        height: 180,
        alt: "RO-TEA",
      },
    ],
  },
};

export default function KontaktLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
