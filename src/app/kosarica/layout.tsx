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
  },
};

export default function KosaricaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
