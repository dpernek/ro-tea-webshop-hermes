import { db } from "@/lib/db";
import { zagrebDate } from "@/lib/compliance/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = zagrebDate(new Date());
    const archive = await db.priceListSnapshot.findMany({
      orderBy: { publishedAt: "desc" },
      select: {
        filename: true,
        localDate: true,
        checksum: true,
        rowCount: true,
        publishedAt: true,
      },
    });
    return Response.json(
      {
        today,
        timeZone: "Europe/Zagreb",
        scheduledTime: "07:30",
        current:
          archive.find((snapshot) => snapshot.localDate === today) ?? null,
        archive: archive.map((snapshot) => ({
          ...snapshot,
          href: `/cjenici/datoteke/${snapshot.filename}`,
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: "Popis cjenika trenutačno nije dostupan." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
