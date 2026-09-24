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

// ── Places-only location (hub 2026-09-24) ────────────────────────────────────
// A `family.locations` row now carries `kind`: "fix" (a member's position, as
// before) or "place" (a places-only member inside a safe zone, pinned at the
// ZONE CENTRE — not the member's position). Rows from an older hub have no
// kind and are fixes. Every row the hub sends this key has coordinates, but a
// row without them must be skipped rather than handed to Leaflet: one bad
// marker throws, and the whole map would fall back to "No locations".

export function pinnable(loc) {
  return !!loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng);
}

export function isPlace(loc) {
  return loc?.kind === "place";
}

/** "8:05 AM" today, "Mon 8:05 AM" on another day, in the viewer's locale. */
export function clockTime(iso, now = new Date()) {
  if (!iso) return "";
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const time = at.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return at.toDateString() === now.toDateString()
    ? time
    : `${at.toLocaleDateString([], { weekday: "short" })} ${time}`;
}

/**
 * The two popup lines under a member's name. A place says where and since
 * when ("At School" / "since 8:05 AM") — never an age, which would read as how
 * stale a position is. A fix keeps its address and age, plus "sharing until …"
 * when it is live only because of a temporary share.
 */
export function popupLines(loc, now = new Date()) {
  if (isPlace(loc)) {
    const since = clockTime(loc.since, now);
    return { primary: `At ${loc.zoneName || "a safe zone"}`, secondary: since ? `since ${since}` : "" };
  }
  const age = timeAgo(loc.updatedAt, now.getTime());
  const until = loc.sharingUntil ? clockTime(loc.sharingUntil, now) : "";
  const secondary = [age, until ? `sharing until ${until}` : ""].filter(Boolean).join(" · ");
  return { primary: loc.address ?? "", secondary };
}
