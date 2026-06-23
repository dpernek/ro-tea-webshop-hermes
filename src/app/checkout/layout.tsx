import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blagajna | RO-TEA",
  description:
    "Završite svoju kupnju — unos podataka za dostavu i dovršetak narudžbe profesionalnog alata. Sigurno i jednostavno.",
  alternates: {
    canonical: "/checkout",
  },
  openGraph: {
    title: "Blagajna | RO-TEA",
    description:
      "Završite svoju kupnju — unos podataka za dostavu i dovršetak narudžbe profesionalnog alata. Sigurno i jednostavno.",
    type: "website",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
