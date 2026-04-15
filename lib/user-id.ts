const KEY = "helistens_user_id";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const created =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(KEY, created);
  return created;
}
