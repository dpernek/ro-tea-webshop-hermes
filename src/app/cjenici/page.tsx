import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cjenici | RO-TEA",
  description: "Dnevni cjenici RO-TEA webshopa i arhiva cjenika.",
};

export default async function PriceListsPage() {
  const snapshots = await db.priceListSnapshot.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      filename: true,
      localDate: true,
      rowCount: true,
      checksum: true,
      publishedAt: true,
    },
  });
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Cjenici webshopa</h1>
      <p className="mt-4 text-slate-600">
        Preuzmite dnevni cjenik u CSV formatu. Datoteke su javno dostupne bez
        prijave. Cijene su u eurima i uključuju PDV.
      </p>
      <a
        className="mt-3 inline-block text-sm underline"
        href="/cjenici/manifest.json"
      >
        Popis datoteka za automatsko preuzimanje (JSON)
      </a>
      {!snapshots.length ? (
        <p className="mt-8">Cjenici su u pripremi.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-600">
            Posljednja objava:{" "}
            {snapshots[0].publishedAt.toLocaleString("hr-HR", {
              timeZone: "Europe/Zagreb",
            })}
            .
          </p>
          <ul className="mt-8 divide-y divide-slate-200">
            {snapshots.map((snapshot, index) => (
              <li key={snapshot.filename} className="py-4">
                <a
                  className="font-semibold text-[#0055a8] underline"
                  href={`/cjenici/datoteke/${encodeURIComponent(snapshot.filename)}`}
                >
                  {index === 0 ? "Najnoviji cjenik — " : "Cjenik — "}
                  {snapshot.localDate}
                </a>
                <p className="mt-1 text-sm break-all text-slate-600">
                  {snapshot.filename} · {snapshot.rowCount} artikala
                </p>
                <details className="mt-1 text-xs text-slate-500">
                  <summary>Kontrolni zbroj datoteke (SHA-256)</summary>
                  <code className="break-all">{snapshot.checksum}</code>
                </details>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
