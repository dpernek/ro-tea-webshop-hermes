import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const SEED_CATALOGS = [
  { name: "Tool Manual 2026", brand: "PFERD", description: "Kompletni pregled alata i rješenja za 2026.", fileUrl: "https://int.pferd.com/en/service/downloads/?oxDeeplink=eyJ1bm...fX19", sortOrder: 0 },
  { name: "FESTA katalog 2025–2026", brand: "FESTA", description: "Veliki izbor FESTA alata za profesionalce.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/FESTA-2025-2026.pdf", sortOrder: 1 },
  { name: "Metabo – generalni katalog", brand: "Metabo", description: "Električni i aku alati, pribor i oprema.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/METABO-generalni-katalog.pdf", sortOrder: 2 },
  { name: "Delta Plus – osnovni program", brand: "Delta Plus", description: "Osobna zaštitna oprema za profesionalce.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/DELTAPLUS-katalog-osnovnog-programa-1.pdf", sortOrder: 3 },
  { name: "Knipex katalog", brand: "Knipex", description: "Profesionalni ručni alati i kliješta.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2020/04/KNIPEX-katalog.pdf", sortOrder: 4 },
  { name: "Dormer Pramet – Holemaking 2024", brand: "Dormer Pramet", description: "Svrdla i alati za bušenje.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/HOLEMAKING-2024-EN.pdf", sortOrder: 5 },
  { name: "Dormer Pramet – Threading 2024", brand: "Dormer Pramet", description: "Alati za izradu navoja.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/THREADING-2024-EN.pdf", sortOrder: 6 },
  { name: "Dormer Pramet – Maintenance & Repair 2022", brand: "Dormer Pramet", description: "Održavanje i popravci.", fileUrl: "https://ro-tea.hr/wp-content/uploads/2025/08/DORMER-katalog-ODRZAVANJE-i-POPRAVCI-1.pdf", sortOrder: 7 },
];

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let count = 0;
  for (const cat of SEED_CATALOGS) {
    await db.catalog.upsert({
      where: { id: cat.name },
      create: cat,
      update: { fileUrl: cat.fileUrl, description: cat.description, active: true },
    });
    count++;
  }

  return NextResponse.json({ ok: true, message: `Seeded ${count} catalogs` });
}
