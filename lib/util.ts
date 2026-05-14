export function generateShareToken(): string {
  const bytes = new Uint8Array(18);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const b64 = Buffer.from(bytes).toString("base64url");
  return `qm_${b64}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export function formatDateTimeUTC(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.toISOString().replace("T", " ").slice(0, 19)} UTC`;
}

export function nextDocNumber(now = new Date(), seq = 0): string {
  const yyyy = now.getFullYear();
  const padded = String(seq + 1).padStart(4, "0");
  return `QM-${yyyy}-${padded}`;
}
