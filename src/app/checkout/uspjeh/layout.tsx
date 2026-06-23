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
  },
};

export default function CheckoutUspjehLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
