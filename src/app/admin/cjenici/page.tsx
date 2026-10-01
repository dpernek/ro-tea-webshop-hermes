"use client";

import { useEffect, useState } from "react";
import type { AnchorRow } from "@/lib/compliance/catalog";

type ReviewRow = AnchorRow & {
  productId: string;
  name: string;
  sku: string | null;
  category: string;
  attributes: string | null;
};
type Review = {
  template: { fingerprint: string; rows: ReviewRow[] };
  errors: string[];
  settings: { address: string; objectCode: string; enabled: boolean };
  runs: Array<{
    id: string;
    status: string;
    detail: string;
    createdAt: string;
  }>;
  snapshots: Array<{ filename: string; localDate: string; rowCount: number }>;
};
const inputClass =
  "w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm";
const buttonClass =
  "rounded bg-[#0055a8] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40";

export default function ComplianceAdminPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [settings, setSettings] = useState({
    address: "",
    objectCode: "WEB-01",
    enabled: false,
  });
  const [source, setSource] = useState(
    "Izjava vlasnika: redovne cijene nisu se mijenjale od referentnog datuma; iznimke i datumi provjereni su po artiklu."
  );
  const [datesChecked, setDatesChecked] = useState(false);
  const [pricesChecked, setPricesChecked] = useState(false);
  const [preview, setPreview] = useState<{
    rowCount: number;
    newAnchors: number;
  } | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");

  async function load() {
    const response = await fetch("/api/admin/cjenici", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok)
      throw new Error(
        data.errors?.join("\n") || data.error || "Pregled nije dostupan."
      );
    setReview(data);
    setRows(data.template.rows);
    setSettings(data.settings);
    setPreview(null);
  }
  useEffect(() => {
    load().catch((error: Error) => setMessages([error.message]));
  }, []);

  function edit(index: number, patch: Partial<ReviewRow>) {
    setRows((previous) =>
      previous.map((row, i) =>
        i === index
          ? {
              ...row,
              ...patch,
              ...(previous[index].itemKey.startsWith("v:") && "stock" in patch
                ? {
                    stockStatus:
                      patch.stock == null
                        ? "UNKNOWN"
                        : patch.stock > 0
                          ? "INSTOCK"
                          : "OUTOFSTOCK",
                  }
                : {}),
            }
          : row.productId === previous[index].productId
            ? {
                ...row,
                ...("brandNotApplicable" in patch
                  ? { brandNotApplicable: patch.brandNotApplicable }
                  : {}),
                ...("saleLabel" in patch ? { saleLabel: patch.saleLabel } : {}),
              }
            : row
      )
    );
    setPreview(null);
  }
  async function action(name: string) {
    setBusy(true);
    setMessages([]);
    try {
      const data =
        name === "settings"
          ? settings
          : name === "publish"
            ? undefined
            : {
                fingerprint: review?.template.fingerprint,
                source,
                acknowledgeReferenceDates: datesChecked,
                acknowledgeUnchangedPrices: pricesChecked,
                rows,
              };
      const response = await fetch("/api/admin/cjenici", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, data }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessages(result.errors ?? ["Radnja nije uspjela."]);
        setPreview(null);
        return;
      }
      if (name === "preview") {
        setPreview(result);
        setMessages([
          `Pregled prošao: ${result.rowCount} artikala, ${result.newAnchors} novih sidrenih cijena. Provjerite podatke prije potvrde.`,
        ]);
      } else {
        await load();
        setMessages([
          name === "confirm"
            ? "Sidrene cijene i podaci spremljeni su s tragom potvrde."
            : name === "settings"
              ? "Postavke spremljene."
              : result.status === "DISABLED"
                ? "Objava je isključena. Uključite je u postavkama nakon provjere podataka."
                : `Cjenik dostupan: ${result.filename}`,
        ]);
      }
    } catch (error) {
      setMessages([
        error instanceof Error ? error.message : "Radnja nije uspjela.",
      ]);
    } finally {
      setBusy(false);
    }
  }

  const filtered = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) =>
      `${row.name} ${row.sku ?? ""} ${row.category}`
        .toLocaleLowerCase("hr")
        .includes(filter.toLocaleLowerCase("hr"))
    );
  const maxPage = Math.max(0, Math.ceil(filtered.length / 30) - 1);
  const currentPage = Math.min(page, maxPage);

  async function downloadCsvPreview() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/cjenici/csv", {
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json();
        setMessages(data.errors ?? ["Pregled CSV-a nije dostupan."]);
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1] ?? "pregled_webshop.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessages([
        "Preuzet je pregled spremljenih podataka. Datoteka nije objavljena u javnoj arhivi.",
      ]);
    } catch {
      setMessages(["Pregled CSV-a nije dostupan. Pokušajte ponovno."]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Cjenici i sidrene cijene</h1>
      <p className="max-w-4xl text-sm text-slate-600">
        Jedan webshop. Predložene sidrene cijene preuzimaju sadašnje redovne
        cijene na temelju izjave da se nisu mijenjale. Provjerite artikle
        uvedene nakon 10. 9. 2026. i kategorije s datumom 2. 5. 2025. Potvrđene
        sidrene cijene ovim se pregledom ne mogu prepisati.
      </p>
      {messages.length > 0 && (
        <div
          role="status"
          className="max-h-64 overflow-auto rounded border bg-slate-50 p-4 text-sm"
        >
          <ul>
            {messages.map((message, i) => (
              <li key={i}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      {!review ? (
        <p>
          {messages.length ? "Pregled nije učitan." : "Učitavanje pregleda…"}
        </p>
      ) : (
        <>
          <section className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">
              1. Pregled i potvrda artikala ({rows.length})
            </h2>
            <p className="text-sm text-slate-600">
              Iznosi uključuju PDV. „Nije primjenjivo” označite samo kada
              podatak stvarno ne vrijedi za taj artikl. Prazna zaliha znači da
              količina nije poznata. Marka i vrsta prodaje zajedničke su svim
              varijantama proizvoda. Količinu pakiranja provjerite za svaku
              varijantu.
            </p>
            <label className="block max-w-md text-sm">
              Traži naziv, šifru ili kategoriju
              <input
                className={inputClass}
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(0);
                }}
              />
            </label>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th>Artikl</th>
                    <th>Sidrena cijena / datum</th>
                    <th>Barkod</th>
                    <th>Jedinica mjere</th>
                    <th>Marka / posebna prodaja</th>
                    <th>Raspoloživost</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .slice(currentPage * 30, currentPage * 30 + 30)
                    .map(({ row, index }) => (
                      <tr
                        key={row.itemKey}
                        className="border-b align-top [&>td]:p-2"
                      >
                        <td className="w-64">
                          <strong>{row.name}</strong>
                          <p>{row.sku || row.itemKey}</p>
                          <p className="text-xs text-slate-500">
                            {row.category} {row.attributes}
                          </p>
                        </td>
                        <td className="space-y-1">
                          <label className="block">
                            EUR
                            <input
                              aria-label={`Sidrena cijena ${row.sku || row.name}`}
                              type="number"
                              min="0"
                              step="0.01"
                              className={inputClass}
                              value={
                                Number.isFinite(row.anchorPriceCents)
                                  ? row.anchorPriceCents / 100
                                  : ""
                              }
                              onChange={(event) =>
                                edit(index, {
                                  anchorPriceCents:
                                    event.target.value === ""
                                      ? NaN
                                      : Math.round(
                                          Number(event.target.value) * 100
                                        ),
                                })
                              }
                            />
                          </label>
                          <select
                            aria-label={`Referentni režim ${row.sku || row.name}`}
                            className={inputClass}
                            value={row.anchorRegime}
                            onChange={(event) => {
                              const regime = event.target
                                .value as AnchorRow["anchorRegime"];
                              edit(index, {
                                anchorRegime: regime,
                                anchorDate:
                                  regime === "GENERAL_2026"
                                    ? "2026-09-10"
                                    : regime === "LEGACY_2025"
                                      ? "2025-05-02"
                                      : "",
                              });
                            }}
                          >
                            <option value="GENERAL_2026">10. 9. 2026.</option>
                            <option value="LEGACY_2025">2. 5. 2025.</option>
                            <option value="FIRST_LISTED">
                              Prvi put u ponudi
                            </option>
                          </select>
                          <input
                            aria-label={`Datum sidra ${row.sku || row.name}`}
                            className={inputClass}
                            type="date"
                            value={row.anchorDate}
                            disabled={row.anchorRegime !== "FIRST_LISTED"}
                            onChange={(event) =>
                              edit(index, { anchorDate: event.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={`Barkod ${row.sku || row.name}`}
                            className={inputClass}
                            value={row.barcode ?? ""}
                            disabled={row.barcodeNotApplicable}
                            onChange={(event) =>
                              edit(index, {
                                barcode: event.target.value || null,
                              })
                            }
                          />
                          <label className="mt-2 block">
                            <input
                              type="checkbox"
                              checked={row.barcodeNotApplicable}
                              onChange={(event) =>
                                edit(index, {
                                  barcodeNotApplicable: event.target.checked,
                                  ...(event.target.checked
                                    ? { barcode: null }
                                    : {}),
                                })
                              }
                            />{" "}
                            Nije primjenjivo
                          </label>
                        </td>
                        <td>
                          <label className="block">
                            Jedinica (kg, l, m…)
                            <input
                              className={inputClass}
                              value={row.unitMeasure ?? ""}
                              disabled={row.unitNotApplicable}
                              onChange={(event) =>
                                edit(index, {
                                  unitMeasure: event.target.value || null,
                                })
                              }
                            />
                          </label>
                          <label className="block">
                            Količina pakiranja u toj jedinici
                            <input
                              className={inputClass}
                              type="number"
                              min="0"
                              step="any"
                              value={row.unitQuantity ?? ""}
                              disabled={row.unitNotApplicable}
                              onChange={(event) =>
                                edit(index, {
                                  unitQuantity: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                })
                              }
                            />
                          </label>
                          <label className="mt-2 block">
                            <input
                              type="checkbox"
                              checked={row.unitNotApplicable}
                              onChange={(event) =>
                                edit(index, {
                                  unitNotApplicable: event.target.checked,
                                  ...(event.target.checked
                                    ? { unitMeasure: null, unitQuantity: null }
                                    : {}),
                                })
                              }
                            />{" "}
                            Nije primjenjivo
                          </label>
                        </td>
                        <td>
                          <label className="block">
                            <input
                              type="checkbox"
                              checked={row.brandNotApplicable}
                              onChange={(event) =>
                                edit(index, {
                                  brandNotApplicable: event.target.checked,
                                })
                              }
                            />{" "}
                            Artikl nema marku
                          </label>
                          <label className="mt-2 block">
                            Vrsta posebne prodaje
                            <input
                              className={inputClass}
                              placeholder="Npr. akcijska prodaja"
                              value={row.saleLabel ?? ""}
                              onChange={(event) =>
                                edit(index, {
                                  saleLabel: event.target.value || null,
                                })
                              }
                            />
                          </label>
                        </td>
                        <td>
                          <label className="block">
                            Količina na zalihi
                            <input
                              className={inputClass}
                              type="number"
                              min="0"
                              step="1"
                              value={row.stock ?? ""}
                              onChange={(event) =>
                                edit(index, {
                                  stock: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                                })
                              }
                            />
                          </label>
                          <select
                            aria-label={`Raspoloživost ${row.sku || row.name}`}
                            className={inputClass}
                            value={row.stockStatus}
                            disabled={row.itemKey.startsWith("v:")}
                            onChange={(event) =>
                              edit(index, {
                                stockStatus: event.target
                                  .value as AnchorRow["stockStatus"],
                              })
                            }
                          >
                            <option value="UNKNOWN">Nepoznato</option>
                            <option value="INSTOCK">Dostupno</option>
                            <option value="OUTOFSTOCK">Nedostupno</option>
                            <option value="ONBACKORDER">Po narudžbi</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 0}
                className={buttonClass}
                onClick={() => setPage(currentPage - 1)}
              >
                Prethodna
              </button>
              <span>
                Stranica {currentPage + 1} / {maxPage + 1}
              </span>
              <button
                disabled={currentPage === maxPage}
                className={buttonClass}
                onClick={() => setPage(currentPage + 1)}
              >
                Sljedeća
              </button>
            </div>
            <label className="block text-sm">
              Izvor i obrazloženje potvrde
              <textarea
                className={inputClass}
                rows={3}
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setPreview(null);
                }}
              />
            </label>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={datesChecked}
                onChange={(event) => {
                  setDatesChecked(event.target.checked);
                  setPreview(null);
                }}
              />{" "}
              Provjerio/la sam referentne datume, iznimke iz 2025. i artikle
              prvi put uvedene kasnije.
            </label>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={pricesChecked}
                onChange={(event) => {
                  setPricesChecked(event.target.checked);
                  setPreview(null);
                }}
              />{" "}
              Potvrđujem navedene povijesne redovne cijene i izjavu da se nisu
              mijenjale.
            </label>
            <div className="flex gap-3">
              <button
                className={buttonClass}
                disabled={busy || !datesChecked || !pricesChecked}
                onClick={() => action("preview")}
              >
                Provjeri prije spremanja
              </button>
              <button
                className={buttonClass}
                disabled={busy || !preview}
                onClick={() => action("confirm")}
              >
                Potvrdi i spremi {preview?.rowCount ?? ""} artikala
              </button>
            </div>
          </section>
          <section className="space-y-4 rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold">2. Dnevni cjenik webshopa</h2>
            <label className="block text-sm">
              Adresa webshopa / objekta za naziv datoteke
              <input
                className={inputClass}
                value={settings.address}
                onChange={(event) =>
                  setSettings({ ...settings, address: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              Oznaka webshopa
              <input
                className={inputClass}
                value={settings.objectCode}
                onChange={(event) =>
                  setSettings({ ...settings, objectCode: event.target.value })
                }
              />
            </label>
            <label className="block text-sm">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(event) =>
                  setSettings({ ...settings, enabled: event.target.checked })
                }
              />{" "}
              Uključi dnevnu objavu nakon završene provjere
            </label>
            <p className="text-sm text-slate-600">
              Raspored je 07:30 po hrvatskom vremenu, s ponovnim provjerama u
              07:40 i 07:50. Automatski se pokreće nakon aktivacije rasporeda.
              Neuspjelu objavu ponovite ovdje nakon ispravka podataka. Već
              objavljena datoteka za isti dan ostaje sačuvana.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className={buttonClass}
                disabled={busy}
                onClick={downloadCsvPreview}
              >
                Preuzmi CSV za pregled
              </button>
              <button
                className={buttonClass}
                disabled={busy}
                onClick={() => action("settings")}
              >
                Spremi postavke
              </button>
              <button
                className={buttonClass}
                disabled={busy}
                onClick={() => action("publish")}
              >
                Objavi današnji cjenik
              </button>
              <a className="self-center text-sm underline" href="/cjenici">
                Javna arhiva
              </a>
            </div>
            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                Preostale provjere podataka ({review.errors.length})
              </summary>
              <ul className="max-h-64 overflow-auto text-sm">
                {review.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </details>
            <h3 className="font-semibold">Posljednje objave i pogreške</h3>
            <ul className="space-y-2 text-sm">
              {review.runs.map((run) => (
                <li className="whitespace-pre-wrap" key={run.id}>
                  {new Date(run.createdAt).toLocaleString("hr-HR", {
                    timeZone: "Europe/Zagreb",
                  })}{" "}
                  — {run.status}: {run.detail}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
