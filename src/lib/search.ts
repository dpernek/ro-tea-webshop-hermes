// Fuzzy search za katalog — Levenshtein + normalizacija dijakritika (č→c, š→s, ž→z, đ→d).
// 846 proizvoda ranka u JS-u u milisekundama — nema potrebe za pg_trgm.

export function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .replace(/dž/g, "dz");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1).fill(0).map((_, i) => i);
  let curr = new Array(n + 1).fill(0);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

// Maksimalna tolerancija po tokenu: max(1, 40% duljine)
function tokenThreshold(len: number): number {
  return Math.max(1, Math.floor(len * 0.4));
}

// Distanca tokena prema imenu: min po riječima imena + cijelo ime.
// 0 ako je token podstring neke riječi (contains ekvivalent).
function tokenDistance(token: string, nameNorm: string): number {
  const words = nameNorm.split(/[\s\-–—/()]+/).filter(Boolean);
  let best = Infinity;
  for (const w of words) {
    if (w.includes(token)) return 0;
    best = Math.min(best, levenshtein(token, w));
  }
  // i prema cijelom imenu (za više-riječne nazive)
  if (nameNorm.includes(token)) return 0;
  best = Math.min(best, levenshtein(token, nameNorm));
  return best;
}

/**
 * Score za proizvod prema queryju. Svi tokeni moraju proći prag.
 * Vraća null ako proizvod ne odgovara; manji broj = bolje.
 */
export function fuzzyScore(
  name: string,
  sku: string | null | undefined,
  query: string
): number | null {
  const q = normalizeString(query).trim();
  if (!q) return null;
  const nameNorm = normalizeString(name || "");
  const skuNorm = normalizeString(sku || "");

  // 1) potpuni contains (najjači match) — 0
  if (nameNorm.includes(q) || (skuNorm && skuNorm.includes(q))) return 0;

  const tokens = q.split(/\s+/).filter(Boolean);
  let total = 0;
  for (const t of tokens) {
    const dist = Math.min(tokenDistance(t, nameNorm), tokenDistance(t, skuNorm));
    if (dist > tokenThreshold(t.length)) return null;
    total += dist;
  }
  return total;
}

export interface RankedProduct<T> {
  item: T;
  score: number;
}

/** Rankira proizvode po fuzzy scoreu; zadržava samo matcheve, sortira po score pa ime. */
export function rankProducts<T extends { name: string; sku?: string | null }>(
  products: T[],
  query: string
): RankedProduct<T>[] {
  const ranked: RankedProduct<T>[] = [];
  for (const p of products) {
    const score = fuzzyScore(p.name, p.sku, query);
    if (score !== null) ranked.push({ item: p, score });
  }
  ranked.sort(
    (a, b) =>
      a.score - b.score ||
      a.item.name.localeCompare(b.item.name, "hr")
  );
  return ranked;
}
