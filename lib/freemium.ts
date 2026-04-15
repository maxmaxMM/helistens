/**
 * Simple client flags — no complex memory.
 * First free session gets full verse + prayer once; then locked until Pro.
 */

const LS_USED_FULL = "helistens_has_used_full_experience";
const LS_PRO = "helistens_pro_full_access";

export function getHasUsedFullExperience(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_USED_FULL) === "1";
}

export function setHasUsedFullExperience(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USED_FULL, "1");
}

export function isProUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(LS_PRO) === "1";
}

export function setProSubscriber(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_PRO, "1");
}

/** Preview only — not the full string when locked. */
export function previewVerse(text: string, maxChars = 42): string {
  const t = text.trim();
  if (!t) return "The Lord is close to the broken…";
  if (t.length <= maxChars) {
    return t.endsWith("…") || t.endsWith("...") ? t : `${t}…`;
  }
  const cut = t.slice(0, maxChars).trim();
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 20 ? cut.slice(0, lastSpace) : cut;
  return `${base}…`;
}

export function previewPrayer(text: string, maxChars = 28): string {
  const t = text.trim();
  if (!t) return "May you feel peace…";
  if (t.length <= maxChars) {
    return t.endsWith("…") || t.endsWith("...") ? t : `${t}…`;
  }
  const cut = t.slice(0, maxChars).trim();
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 12 ? cut.slice(0, lastSpace) : cut;
  return `${base}…`;
}

export const PAYWALL_COPY = {
  title: "Get a verse and prayer for your situation",
  subtitle:
    "Not just advice, but spiritual support when you need it.",
  cta: "Start full access – $2.99/month",
  dismiss: "Not now",
} as const;
