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

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
