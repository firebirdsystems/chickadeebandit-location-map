import { describe, it, expect } from "vitest";
import { AVATAR_COLORS, memberColor, initial, esc, timeAgo, sharingLabel } from "../src/logic.js";

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
