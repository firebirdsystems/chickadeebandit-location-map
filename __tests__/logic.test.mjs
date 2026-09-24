import { describe, it, expect } from "vitest";
import { AVATAR_COLORS, memberColor, initial, esc, timeAgo, sharingLabel, pinnable, isPlace, clockTime, popupLines } from "../src/logic.js";

describe("memberColor", () => {
  it("is deterministic and within the palette", () => {
    expect(memberColor("abc")).toBe(memberColor("abc"));
    expect(AVATAR_COLORS).toContain(memberColor("abc"));
  });
});

describe("initial", () => {
  it("uppercases the first non-space character", () => expect(initial("  alex")).toBe("A"));
  it("falls back to ? for empty", () => expect(initial("   ")).toBe("?"));
});

describe("esc", () => {
  it("escapes HTML metacharacters", () => {
    expect(esc(`<b>"x"&`)).toBe("&lt;b&gt;&quot;x&quot;&amp;");
  });
  it("stringifies nullish to empty", () => expect(esc(null)).toBe(""));
});

describe("timeAgo", () => {
  const now = new Date("2026-07-08T12:00:00Z").getTime();
  it("empty for falsy", () => expect(timeAgo("", now)).toBe(""));
  it("just now under a minute", () => {
    expect(timeAgo(new Date(now - 30_000).toISOString(), now)).toBe("just now");
  });
  it("minutes, hours, and days", () => {
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5m ago");
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe("3h ago");
    expect(timeAgo(new Date(now - 2 * 86_400_000).toISOString(), now)).toBe("2d ago");
  });
});

describe("sharingLabel", () => {
  it("pluralizes correctly", () => {
    expect(sharingLabel(1)).toBe("1 member sharing");
    expect(sharingLabel(3)).toBe("3 members sharing");
  });
});

describe("places-only rows (hub kind: place)", () => {
  const now = new Date(2026, 8, 24, 15, 0, 0);

  it("pins only rows with coordinates — one bad row must not blank the map", () => {
    expect(pinnable({ lat: 1, lng: 2 })).toBe(true);
    expect(pinnable({ kind: "out", since: "x" })).toBe(false);
    expect(pinnable({ lat: "1", lng: 2 })).toBe(false);
    expect(pinnable(null)).toBe(false);
  });

  it("treats a row with no kind (an older hub) as a fix", () => {
    expect(isPlace({ lat: 1, lng: 2 })).toBe(false);
    expect(isPlace({ kind: "place" })).toBe(true);
  });

  it("says where and since when for a place — never an age", () => {
    const since = new Date(2026, 8, 24, 8, 5, 0).toISOString();
    const lines = popupLines({ kind: "place", zoneName: "School", since, updatedAt: since }, now);
    expect(lines.primary).toBe("At School");
    expect(lines.secondary).toMatch(/^since 8:05/);
    expect(lines.secondary).not.toContain("ago");
  });

  it("keeps a fix's address and age, and marks a temporary share", () => {
    const lines = popupLines({
      kind: "fix", address: "12 Elm St", updatedAt: new Date(now.getTime() - 5 * 60_000).toISOString(),
      sharingUntil: new Date(2026, 8, 24, 19, 30, 0).toISOString(),
    }, now);
    expect(lines.primary).toBe("12 Elm St");
    expect(lines.secondary).toMatch(/^5m ago · sharing until 7:30/);
  });

  it("adds the weekday for a time that is not today", () => {
    expect(clockTime(new Date(2026, 8, 21, 9, 0, 0).toISOString(), now)).toMatch(/^Mon /);
    expect(clockTime("nope", now)).toBe("");
  });
});
