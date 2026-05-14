import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "qm_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET is not set or too short");
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionValue(): string {
  const issuedAt = Date.now().toString(36);
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export function isValidSessionValue(value: string | undefined | null): boolean {
  if (!value) return false;
  const [issuedAt, sig] = value.split(".");
  if (!issuedAt || !sig) return false;
  let expected: string;
  try {
    expected = sign(issuedAt);
  } catch {
    return false;
  }
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))
  ) {
    return false;
  }
  const ts = parseInt(issuedAt, 36);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < SESSION_TTL_MS;
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

export async function isAuthenticatedFromCookies(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(COOKIE_NAME)?.value);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

/** Single-tenant constant — every contract is "owned by" this UUID. */
export const ADMIN_OWNER_ID = "00000000-0000-0000-0000-000000000001";
