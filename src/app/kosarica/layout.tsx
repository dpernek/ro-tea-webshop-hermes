import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Košarica | RO-TEA",
  description:
    "Pregledajte proizvode u svojoj košarici. Brza i jednostavna kupnja profesionalnog alata i opreme — RO-TEA.",
  alternates: {
    canonical: "/kosarica",
  },
  openGraph: {
    title: "Košarica | RO-TEA",
    description:
      "Pregledajte proizvode u svojoj košarici. Brza i jednostavna kupnja profesionalnog alata i opreme — RO-TEA.",
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

export default function KosaricaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
