// Pure, testable logic extracted from index.html.
// No DOM, no network — safe to import from Node for unit tests.

export const AVATAR_COLORS = [
  "#0284c7", "#0891b2", "#059669", "#7c3aed", "#db2777", "#ea580c", "#65a30d", "#b45309",
];

export function memberColor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initial(name) {
  return String(name).trim()[0]?.toUpperCase() ?? "?";
}

export function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return "";
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function sharingLabel(n) {
  return `${n} member${n !== 1 ? "s" : ""} sharing`;
}
