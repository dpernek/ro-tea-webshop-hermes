// GLS config — reads env vars, defaults to test mode.
// NEVER expose credentials client-side; this module is server-only.
import "server-only";
import { createHash } from "crypto";

export class GlsError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "GlsError";
  }
}

// ── Environment ──────────────────────────────────────────────────

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== "") return value;
  if (fallback !== undefined) return fallback;
  throw new GlsError(
    `Nedostaje obavezna varijabla okruženja: ${key}. Postavite ${key} u .env datoteci.`,
    "MISSING_ENV",
  );
}

// ── Config interface ─────────────────────────────────────────────

export interface GlsConfig {
  /** Test mode — when true, uses the test GLS endpoint */
  testMode: boolean;
  /** GLS SOAP API base URL */
  apiBaseUrl: string;
  /** GLS SOAP WSDL / singleWsdl endpoint */
  wsdlUrl: string;
  /** GLS username for authentication */
  username: string;
  /** GLS password — hashed with SHA512 */
  passwordHash: string;
  /** GLS client number */
  clientNumber: number;
  /** Default country code */
  countryCode: string;
}

// ── Singleton config ─────────────────────────────────────────────

let _config: GlsConfig | null = null;

export function getGlsConfig(): GlsConfig {
  if (_config) return _config;

  const testMode = getEnv("GLS_TEST_MODE", "false").toLowerCase() === "true";

  const apiBaseUrl = getEnv(
    "GLS_API_BASE_URL",
    "https://api.mygls.hr",
  );

  const wsdlUrl = `${apiBaseUrl}/ParcelService.svc/soap`;

  const username = getEnv("GLS_USERNAME");
  const rawPassword = getEnv("GLS_PASSWORD");
  const passwordHash = createHash("sha512")
    .update(rawPassword, "utf8")
    .digest("base64");

  const clientNumber = Number(getEnv("GLS_CLIENT_NUMBER"));

  if (isNaN(clientNumber) || clientNumber <= 0) {
    throw new GlsError(
      "GLS_CLIENT_NUMBER mora biti valjani pozitivni broj.",
      "INVALID_CLIENT_NUMBER",
    );
  }

  const countryCode = getEnv("GLS_COUNTRY_CODE", "HR");

  _config = {
    testMode,
    apiBaseUrl,
    wsdlUrl,
    username,
    passwordHash,
    clientNumber,
    countryCode,
  };

  return _config;
}

/**
 * Check if GLS is configured (all required env vars present).
 * Does NOT throw — safe for conditional checks.
 */
export function isGlsConfigured(): boolean {
  return !!(
    process.env.GLS_USERNAME &&
    process.env.GLS_PASSWORD &&
    process.env.GLS_CLIENT_NUMBER
  );
}

/** Reset cached config — useful for testing */
export function resetGlsConfig(): void {
  _config = null;
}
