import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!/^[a-zA-Z0-9_.-]+\.csv$/.test(filename))
    return new Response("Datoteka nije pronađena.", { status: 404 });
  const snapshot = await db.priceListSnapshot.findUnique({
    where: { filename },
    select: { content: true, checksum: true },
  });
  if (!snapshot)
    return new Response("Datoteka nije pronađena.", { status: 404 });
  const headers = {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
    ETag: `"${snapshot.checksum}"`,
    "X-Content-Type-Options": "nosniff",
  };
  if (request.headers.get("if-none-match") === headers.ETag)
    return new Response(null, { status: 304, headers });
  return new Response(snapshot.content, { headers });
}
