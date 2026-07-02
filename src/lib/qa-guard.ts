/**
 * QA/Test content guard — blocks obvious test patterns in production data.
 * Returns an error message if content looks like a QA/test placeholder, or null if OK.
 */

const BLOCK_PATTERNS: { pattern: RegExp; message: string }[] = [
  // Exact QA/test markers we've had real incidents with
  { pattern: /^Test$/i, message: "Testni sadržaj nije dopušten. Unesite stvaran opis (npr. \"Test\" kao jedina vrijednost)." },
  { pattern: /^QA$/i, message: "QA sadržaj nije dopušten." },
  { pattern: /^AUDIT$/i, message: "Testni sadržaj (AUDIT) nije dopušten." },
  { pattern: /^CRUD$/i, message: "Testni sadržaj (CRUD) nije dopušten." },
  // CMS specific patterns
  { pattern: /QA-CMS/i, message: "QA testni CMS sadržaj nije dopušten." },
  { pattern: /QA-CTA/i, message: "QA testni CTA sadržaj nije dopušten." },
  { pattern: /Changed via QA/i, message: "QA testni sadržaj nije dopušten." },
  { pattern: /QA Kategorije/i, message: "QA testni sadržaj nije dopušten." },
  { pattern: /\[CLAIM:QA\]/i, message: "QA testni claim marker nije dopušten." },
  // Product-level test patterns
  { pattern: /SEC-TEST/i, message: "Testni sadržaj (SEC-TEST) nije dopušten." },
  { pattern: /Test Proizvod QA/i, message: "Testni proizvod nije dopušten." },
  { pattern: /AUDIT-TEST/i, message: "Testni sadržaj (AUDIT-TEST) nije dopušten." },
  { pattern: /CRUD-TEST/i, message: "Testni sadržaj (CRUD-TEST) nije dopušten." },
  { pattern: /test-proizvod-qa/i, message: "Testni proizvod slug nije dopušten." },
];

/**
 * Check a single field value against QA/test patterns.
 * Returns null if OK, or an error message string if blocked.
 */
export function checkQAContent(value: string | null | undefined, fieldName?: string): string | null {
  if (!value || typeof value !== "string" || value.trim().length === 0) return null;

  const trimmed = value.trim();

  for (const { pattern, message } of BLOCK_PATTERNS) {
    if (pattern.test(trimmed)) {
      const field = fieldName ? ` (${fieldName})` : "";
      return `${message}${field}`;
    }
  }

  return null;
}

/**
 * Check multiple fields at once. Returns first error or null.
 */
export function checkQAFields(fields: Record<string, string | null | undefined>): string | null {
  for (const [name, value] of Object.entries(fields)) {
    const error = checkQAContent(value, name);
    if (error) return error;
  }
  return null;
}

/**
 * Customer/test data warning patterns — only warns, doesn't block.
 * Returns warning message or null.
 */
const WARN_PATTERNS: { pattern: RegExp; message: string }[] = [
  { pattern: /test@test\./i, message: "Testni email uzorak." },
  { pattern: /QA Flow/i, message: "QA testni uzorak." },
  { pattern: /Test Kupac/i, message: "Testni uzorak kupca." },
  { pattern: /^Test$/i, message: "Testno ime." },
];

export function warnQACustomer(name: string | null | undefined, email: string | null | undefined): string | null {
  const checks = [{ value: name, label: "ime" }, { value: email, label: "email" }];
  for (const { value, label } of checks) {
    if (!value) continue;
    for (const { pattern, message } of WARN_PATTERNS) {
      if (pattern.test(value)) {
        return `QA upozorenje: ${message} (${label}: "${value}")`;
      }
    }
  }
  return null;
}
