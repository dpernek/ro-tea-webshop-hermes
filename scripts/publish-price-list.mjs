import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Zagreb",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zagreb",
  hour: "2-digit",
  hourCycle: "h23",
});
export const localDate = (date) => dateFormatter.format(date);
class PriceListJobError extends Error {}

// HTTP success alone is insufficient: verify today's immutable file without auth.
export async function publishAndVerify({
  origin,
  secret,
  request = fetch,
  now = () => new Date(),
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  enforceDeadline = true,
  attempts = 3,
}) {
  if (!secret)
    throw new PriceListJobError(
      "Nedostaje CRON_SECRET u GitHub Actions secrets."
    );
  let base;
  try {
    base = new URL(origin);
  } catch {
    throw new PriceListJobError("Nedostaje valjana HTTPS adresa webshopa.");
  }
  if (base.protocol !== "https:" || base.username || base.password)
    throw new PriceListJobError(
      "Webshop mora imati HTTPS adresu bez pristupnih podataka."
    );
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await request(new URL("/api/cron/cjenici", base), {
        headers: { authorization: `Bearer ${secret}` },
        redirect: "error",
        signal: AbortSignal.timeout(75000),
        cache: "no-store",
      });
      if (!response.ok)
        throw new PriceListJobError(
          `Objava cjenika nije uspjela (HTTP ${response.status}).`
        );
      const result = await response.json();
      if (!["PUBLISHED", "EXISTING"].includes(result.status))
        throw new PriceListJobError(
          "Dnevna objava nije uključena ili nije dovršena."
        );

      const manifestResponse = await request(
        new URL("/cjenici/manifest.json", base),
        {
          redirect: "error",
          signal: AbortSignal.timeout(30000),
          cache: "no-store",
        }
      );
      if (!manifestResponse.ok)
        throw new PriceListJobError(
          "Javni popis cjenika nije dostupan bez prijave."
        );
      const manifest = await manifestResponse.json();
      const current = manifest.current;
      const publishedAt = new Date(current?.publishedAt);
      if (
        !current ||
        current.localDate !== localDate(now()) ||
        localDate(publishedAt) !== current.localDate ||
        current.filename !== result.filename ||
        !/^[a-zA-Z0-9_.-]+\.csv$/.test(current.filename) ||
        !/^[a-f0-9]{64}$/.test(current.checksum) ||
        !Number.isSafeInteger(current.rowCount) ||
        current.rowCount < 1
      )
        throw new PriceListJobError(
          "Nije potvrđen valjan cjenik za današnji hrvatski datum."
        );
      const csvResponse = await request(
        new URL(`/cjenici/datoteke/${current.filename}`, base),
        {
          redirect: "error",
          signal: AbortSignal.timeout(30000),
          cache: "no-store",
        }
      );
      if (
        !csvResponse.ok ||
        !csvResponse.headers.get("content-type")?.startsWith("text/csv")
      )
        throw new PriceListJobError(
          "CSV datoteka nije javno dostupna bez prijave."
        );
      const bytes = Buffer.from(await csvResponse.arrayBuffer());
      if (createHash("sha256").update(bytes).digest("hex") !== current.checksum)
        throw new PriceListJobError(
          "Sadržaj javnog CSV-a ne odgovara arhiviranoj datoteci."
        );
      if (enforceDeadline && Number(hourFormatter.format(publishedAt)) >= 8)
        throw new PriceListJobError(
          "Današnji cjenik objavljen je nakon roka 08:00."
        );
      return { ...current, status: result.status };
    } catch (error) {
      // Do not print raw fetch errors, responses or credentials into public logs.
      lastError = error;
      if (attempt + 1 < attempts) await sleep(10000 * (attempt + 1));
    }
  }
  throw new PriceListJobError(
    lastError instanceof PriceListJobError
      ? lastError.message
      : "Mrežna provjera cjenika nije uspjela. Provjerite webshop i bazu."
  );
}

async function main() {
  try {
    const result = await publishAndVerify({
      origin: process.env.PRICE_LIST_ORIGIN,
      secret: process.env.CRON_SECRET,
      enforceDeadline: process.env.PRICE_LIST_ENFORCE_DEADLINE !== "false",
    });
    console.log(
      `Cjenik ${result.localDate}: ${result.rowCount} artikala, ${result.status}.`
    );
    console.log(`Javni CSV i SHA-256 potvrđeni: ${result.filename}`);
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main();
}
