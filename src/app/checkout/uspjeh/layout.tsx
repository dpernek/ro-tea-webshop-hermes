import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Narudžba zaprimljena | RO-TEA",
  description:
    "Vaša narudžba je uspješno zaprimljena. Hvala na kupnji! Obavijestit ćemo vas e-mailom o statusu narudžbe.",
  alternates: {
    canonical: "/checkout/uspjeh",
  },
  openGraph: {
    title: "Narudžba zaprimljena | RO-TEA",
    description:
      "Vaša narudžba je uspješno zaprimljena. Hvala na kupnji! Obavijestit ćemo vas e-mailom o statusu narudžbe.",
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

export default function CheckoutUspjehLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
